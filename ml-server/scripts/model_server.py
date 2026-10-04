#!/usr/bin/env python3
"""
STAR+ Model Server - FastAPI service for PRE_FLIGHT vs POST_FLIGHT classification
Compatible with the STAR+ dashboard architecture (astronaut_space_health project)
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Model paths
MODEL_DIR = Path(os.environ.get("ASTRO_SPACE_MODEL_DIR")) if os.environ.get("ASTRO_SPACE_MODEL_DIR") else Path(__file__).resolve().parent.parent / "models"
LOGISTIC_MODEL_PATH = MODEL_DIR / "LogisticRegression_PRE_POST_FLIGHT.pkl"
RANDOM_FOREST_MODEL_PATH = MODEL_DIR / "RandomForest_PRE_POST_FLIGHT.pkl"
RESULTS_PATH = MODEL_DIR / "PRE_POST_FLIGHT_CLASSIFICATION_RESULTS.json"

# Global model storage
models = {}
model_metadata = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup."""
    global models, model_metadata
    
    # Load Logistic Regression
    if LOGISTIC_MODEL_PATH.exists():
        with open(LOGISTIC_MODEL_PATH, 'rb') as f:
            models['logistic_regression'] = pickle.load(f)
        print(f"Loaded Logistic Regression from {LOGISTIC_MODEL_PATH}")
    else:
        print(f"Warning: Logistic model not found at {LOGISTIC_MODEL_PATH}")
    
    # Load Random Forest
    if RANDOM_FOREST_MODEL_PATH.exists():
        with open(RANDOM_FOREST_MODEL_PATH, 'rb') as f:
            models['random_forest'] = pickle.load(f)
        print(f"Loaded Random Forest from {RANDOM_FOREST_MODEL_PATH}")
    else:
        print(f"Warning: Random Forest model not found at {RANDOM_FOREST_MODEL_PATH}")
    
    # Load metadata
    if RESULTS_PATH.exists():
        with open(RESULTS_PATH, 'r') as f:
            model_metadata = json.load(f)
        print(f"Loaded model metadata from {RESULTS_PATH}")
    
    yield
    
    # Cleanup
    models.clear()
    model_metadata.clear()


app = FastAPI(
    title="STAR+ NASA OSDR Model Server",
    description="PRE_FLIGHT vs POST_FLIGHT biological pattern classification for astronaut health monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# CORS for dashboard integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Pydantic Models (matching dashboard API contract)
# =============================================================================

class BiomarkerInput(BaseModel):
    """Input biomarkers for a single astronaut at a timepoint."""
    subject_id: str = Field(..., description="Astronaut/subject identifier")
    flight_phase: Optional[str] = Field(None, description="PRE_FLIGHT, POST_FLIGHT, IN_FLIGHT, or UNKNOWN")
    sample_id: Optional[str] = Field(None, description="Sample identifier")
    
    # Core biomarkers from NASA OSDR studies
    # CBC (OSD-569)
    white_blood_cell_count: Optional[float] = None
    red_blood_cell_count: Optional[float] = None
    hemoglobin: Optional[float] = None
    hematocrit: Optional[float] = None
    mcv: Optional[float] = None
    mch: Optional[float] = None
    mchc: Optional[float] = None
    rdw: Optional[float] = None
    platelet_count: Optional[float] = None
    mpv: Optional[float] = None
    neutrophils: Optional[float] = None
    lymphocytes: Optional[float] = None
    monocytes: Optional[float] = None
    eosinophils: Optional[float] = None
    basophils: Optional[float] = None
    
    # CMP/Cardiovascular/Immune (OSD-575)
    albumin: Optional[float] = None
    alkaline_phosphatase: Optional[float] = None
    alt: Optional[float] = None
    ast: Optional[float] = None
    total_bilirubin: Optional[float] = None
    bun_creatinine_ratio: Optional[float] = None
    calcium: Optional[float] = None
    carbon_dioxide: Optional[float] = None
    chloride: Optional[float] = None
    creatinine: Optional[float] = None
    egfr: Optional[float] = None
    globulin: Optional[float] = None
    glucose: Optional[float] = None
    potassium: Optional[float] = None
    sodium: Optional[float] = None
    total_protein: Optional[float] = None
    
    # Urine cytokines (OSD-656) - top markers
    il_6: Optional[float] = None
    il_8: Optional[float] = None
    tnf_alpha: Optional[float] = None
    mcp_1: Optional[float] = None
    vegf: Optional[float] = None
    
    # Demographics
    age: Optional[float] = None
    mission_days: Optional[float] = None
    
    class Config:
        extra = "allow"  # Allow additional biomarkers


class PredictionRequest(BaseModel):
    """Request for health prediction."""
    astronaut_id: str = Field(..., description="Astronaut identifier")
    biomarkers: BiomarkerInput = Field(..., description="Biomarker values")
    model: str = Field("random_forest", description="Model to use: logistic_regression or random_forest")
    include_probabilities: bool = Field(True, description="Include class probabilities")


class BatchPredictionRequest(BaseModel):
    """Request for batch predictions."""
    predictions: List[PredictionRequest] = Field(..., description="List of prediction requests")


class HealthPredictionResponse(BaseModel):
    """Response for health prediction."""
    astronaut_id: str
    model_used: str
    prediction: str  # "PRE_FLIGHT" or "POST_FLIGHT"
    confidence: float
    probabilities: Optional[Dict[str, float]] = None
    risk_level: str  # "LOW", "MODERATE", "HIGH"
    timestamp: str
    features_used: int


class BatchPredictionResponse(BaseModel):
    """Response for batch predictions."""
    predictions: List[HealthPredictionResponse]
    summary: Dict[str, Any]


class ModelMetadataResponse(BaseModel):
    """Model metadata response."""
    models_available: List[str]
    default_model: str
    model_performance: Dict[str, Any]
    feature_count: int
    last_trained: str
    data_source: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
    models_loaded: List[str]
    timestamp: str


# =============================================================================
# Helper Functions
# =============================================================================

def get_feature_columns() -> List[str]:
    """Get the feature columns expected by the models from the trained imputer."""
    # Try to get feature names from the loaded models
    for model_name, model in models.items():
        if hasattr(model, 'named_steps') and 'imputer' in model.named_steps:
            imputer = model.named_steps['imputer']
            if hasattr(imputer, 'feature_names_in_'):
                return list(imputer.feature_names_in_)
            if hasattr(imputer, 'n_features_in_'):
                # Fallback: generate placeholder names
                return [f"feature_{i}" for i in range(imputer.n_features_in_)]
    
    # Fallback: basic feature list
    return [
        'age', 'mission_days', 'heart_rate', 'blood_pressure', 'bone_density', 'sleep_hours',
        'white_blood_cell_count', 'red_blood_cell_count', 'hemoglobin', 'hematocrit',
        'mcv', 'mch', 'mchc', 'rdw', 'platelet_count', 'mpv',
        'neutrophils', 'lymphocytes', 'monocytes', 'eosinophils', 'basophils',
        'albumin', 'alkaline_phosphatase', 'alt', 'ast', 'total_bilirubin',
        'bun_creatinine_ratio', 'calcium', 'carbon_dioxide', 'chloride', 'creatinine',
        'egfr', 'globulin', 'glucose', 'potassium', 'sodium', 'total_protein',
        'il_6', 'il_8', 'tnf_alpha', 'mcp_1', 'vegf'
    ]


def prepare_features(biomarker: BiomarkerInput) -> np.ndarray:
    """Convert biomarker input to feature array matching model's expected features."""
    feature_cols = get_feature_columns()
    
    # Convert to dict
    data = biomarker.model_dump(exclude={'subject_id', 'flight_phase', 'sample_id'})
    
    # Create feature array in correct order
    features = []
    for col in feature_cols:
        value = data.get(col)
        if value is None:
            features.append(np.nan)
        else:
            features.append(float(value))
    
    return np.array(features).reshape(1, -1)


def calculate_risk_level(probabilities: Dict[str, float]) -> str:
    """Calculate risk level from prediction probabilities."""
    max_prob = max(probabilities.values())
    if max_prob >= 0.9:
        return "LOW"
    elif max_prob >= 0.7:
        return "MODERATE"
    else:
        return "HIGH"


def predict_with_model(model, features: np.ndarray, model_name: str) -> tuple:
    """Run prediction with a specific model."""
    try:
        # Get prediction
        pred = model.predict(features)[0]
        
        # Get probabilities if available
        probabilities = None
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(features)[0]
            classes = getattr(model, 'classes_', getattr(model, 'label_encoder_', None))
            if classes is not None:
                probabilities = {str(cls): float(p) for cls, p in zip(classes, proba)}
            else:
                probabilities = {f"class_{i}": float(p) for i, p in enumerate(proba)}
        
        return str(pred), probabilities
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed for {model_name}: {str(e)}")


# =============================================================================
# API Endpoints
# =============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="STAR+ NASA OSDR Model Server",
        version="1.0.0",
        models_loaded=list(models.keys()),
        timestamp=datetime.utcnow().isoformat() + "Z"
    )


@app.get("/schema", response_model=ModelMetadataResponse)
async def get_schema():
    """Get model schema and metadata."""
    return ModelMetadataResponse(
        models_available=list(models.keys()),
        default_model="random_forest",
        model_performance=model_metadata,
        feature_count=len(get_feature_columns()),
        last_trained=model_metadata.get("trained_at", "unknown"),
        data_source="NASA OSDR OSD-569, OSD-575, OSD-656 (Inspiration4 mission)"
    )


@app.get("/model-metadata")
async def get_model_metadata():
    """Get detailed model metadata."""
    return model_metadata


@app.post("/predict/health", response_model=HealthPredictionResponse)
async def predict_health(request: PredictionRequest):
    """
    Predict PRE_FLIGHT vs POST_FLIGHT biological pattern.
    
    This is the main prediction endpoint for the dashboard.
    """
    if request.model not in models:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{request.model}' not available. Available: {list(models.keys())}"
        )
    
    model = models[request.model]
    
    # Prepare features
    features = prepare_features(request.biomarkers)
    
    # Run prediction
    prediction, probabilities = predict_with_model(model, features, request.model)
    
    # Calculate confidence and risk
    confidence = max(probabilities.values()) if probabilities else 0.0
    risk_level = calculate_risk_level(probabilities) if probabilities else "UNKNOWN"
    
    return HealthPredictionResponse(
        astronaut_id=request.astronaut_id,
        model_used=request.model,
        prediction=prediction,
        confidence=confidence,
        probabilities=probabilities if request.include_probabilities else None,
        risk_level=risk_level,
        timestamp=datetime.utcnow().isoformat() + "Z",
        features_used=int(np.sum(~np.isnan(features)))
    )


@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(request: BatchPredictionRequest):
    """Batch prediction for multiple astronauts/timepoints."""
    results = []
    
    for pred_request in request.predictions:
        try:
            result = await predict_health(pred_request)
            results.append(result)
        except Exception as e:
            # Include error in results
            results.append(HealthPredictionResponse(
                astronaut_id=pred_request.astronaut_id,
                model_used=pred_request.model,
                prediction="ERROR",
                confidence=0.0,
                risk_level="ERROR",
                timestamp=datetime.utcnow().isoformat() + "Z",
                features_used=0
            ))
    
    # Summary statistics
    successful = [r for r in results if r.prediction != "ERROR"]
    pre_flight = sum(1 for r in successful if r.prediction == "PRE_FLIGHT")
    post_flight = sum(1 for r in successful if r.prediction == "POST_FLIGHT")
    
    summary = {
        "total": len(results),
        "successful": len(successful),
        "failed": len(results) - len(successful),
        "pre_flight_count": pre_flight,
        "post_flight_count": post_flight,
        "avg_confidence": float(np.mean([r.confidence for r in successful])) if successful else 0.0
    }
    
    return BatchPredictionResponse(predictions=results, summary=summary)


@app.post("/predict/all")
async def predict_all(request: PredictionRequest):
    """
    Run all available models and return ensemble prediction.
    """
    if not models:
        raise HTTPException(status_code=503, detail="No models loaded")
    
    features = prepare_features(request.biomarkers)
    all_predictions = {}
    all_probabilities = {}
    
    for name, model in models.items():
        pred, proba = predict_with_model(model, features, name)
        all_predictions[name] = pred
        if proba:
            all_probabilities[name] = proba
    
    # Ensemble: majority vote
    from collections import Counter
    votes = Counter(all_predictions.values())
    ensemble_prediction = votes.most_common(1)[0][0]
    
    # Average probabilities
    if all_probabilities:
        avg_proba = {}
        for cls in all_probabilities[list(all_probabilities.keys())[0]].keys():
            avg_proba[cls] = float(np.mean([p.get(cls, 0) for p in all_probabilities.values()]))
    else:
        avg_proba = None
    
    confidence = max(avg_proba.values()) if avg_proba else 0.0
    risk_level = calculate_risk_level(avg_proba) if avg_proba else "UNKNOWN"
    
    return HealthPredictionResponse(
        astronaut_id=request.astronaut_id,
        model_used="ensemble",
        prediction=ensemble_prediction,
        confidence=confidence,
        probabilities=avg_proba if request.include_probabilities else None,
        risk_level=risk_level,
        timestamp=datetime.utcnow().isoformat() + "Z",
        features_used=int(np.sum(~np.isnan(features)))
    )


# =============================================================================
# InfluxDB-compatible endpoints (for dashboard integration)
# =============================================================================

@app.get("/influx/health")
async def influx_health():
    """InfluxDB health check."""
    return {"status": "healthy", "influxdb": "not_configured_in_this_service"}


@app.get("/influx/vitals/{astronaut_id}")
async def get_astronaut_vitals(astronaut_id: str):
    """
    Get astronaut vitals from InfluxDB.
    In production, this would query InfluxDB. For now, returns mock structure.
    """
    return {
        "astronaut_id": astronaut_id,
        "message": "InfluxDB not configured in model service. Query InfluxDB directly or use Node API.",
        "expected_measurements": [
            "raw_vitals", "derived_state", "context_state", "predictions"
        ]
    }


@app.post("/predict/from-influx/{astronaut_id}")
async def predict_from_influx(astronaut_id: str, request: PredictionRequest):
    """
    Predict using data from InfluxDB.
    In production, this would fetch latest vitals from InfluxDB.
    """
    # Override astronaut_id from path
    request.astronaut_id = astronaut_id
    return await predict_all(request)


# =============================================================================
# Dashboard-specific endpoints
# =============================================================================

@app.get("/astronauts")
async def list_astronauts():
    """List known astronauts from training data."""
    # In production, this would come from MongoDB/InfluxDB
    return {
        "astronauts": [
            {"id": "C001", "name": "Subject C001", "sex": "M"},
            {"id": "C002", "name": "Subject C002", "sex": "M"},
            {"id": "C003", "name": "Subject C003", "sex": "M"},
            {"id": "C004", "name": "Subject C004", "sex": "M"},
        ],
        "note": "Subjects from Inspiration4 mission (OSD-569/575/656)"
    }


@app.get("/vitals/latest/{astronaut_id}")
async def get_latest_vitals(astronaut_id: str):
    """Get latest vitals for an astronaut."""
    return {
        "astronaut_id": astronaut_id,
        "message": "Query InfluxDB directly for real-time vitals",
        "endpoint": f"GET /influx/vitals/{astronaut_id}"
    }


@app.get("/predictions/latest/{astronaut_id}")
async def get_latest_predictions(astronaut_id: str):
    """Get latest predictions for an astronaut."""
    return {
        "astronaut_id": astronaut_id,
        "message": "Use POST /predict/from-influx/{astronaut_id} to generate predictions"
    }


@app.get("/derived/{astronaut_id}")
async def get_derived_state(astronaut_id: str):
    """Get derived state for an astronaut."""
    return {
        "astronaut_id": astronaut_id,
        "derived_metrics": {
            "health_score": None,
            "risk_category": None,
            "trend": None
        },
        "note": "Derived state computed by Node API from raw vitals"
    }


@app.get("/context/{astronaut_id}")
async def get_context_state(astronaut_id: str):
    """Get context state for an astronaut."""
    return {
        "astronaut_id": astronaut_id,
        "context": {
            "mission_phase": None,
            "days_in_mission": None,
            "countermeasures_active": []
        }
    }


@app.get("/forecast/{astronaut_id}")
async def get_forecast(astronaut_id: str, metric: str = "health_score", horizon: int = 7):
    """Get forecast for an astronaut metric."""
    return {
        "astronaut_id": astronaut_id,
        "metric": metric,
        "horizon_days": horizon,
        "forecast": [],
        "note": "Forecasting not yet implemented in model service"
    }


@app.get("/alerts")
async def get_alerts():
    """Get system-wide alerts."""
    return {
        "alerts": [],
        "note": "Alerts generated by Node API based on prediction thresholds"
    }


@app.get("/alerts/{astronaut_id}")
async def get_astronaut_alerts(astronaut_id: str):
    """Get alerts for a specific astronaut."""
    return {
        "astronaut_id": astronaut_id,
        "alerts": [],
        "note": "Alerts generated by Node API based on prediction thresholds"
    }


# =============================================================================
# Main entry point
# =============================================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)