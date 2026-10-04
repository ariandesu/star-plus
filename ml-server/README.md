# STAR+ Model Server

FastAPI service for **PRE_FLIGHT vs POST_FLIGHT biological pattern classification** using NASA OSDR data (OSD-569, OSD-575, OSD-656).

Designed to integrate with the STAR+ dashboard at `https://star-plus.shareflow.workers.dev/` and the `astronaut_space_health` architecture.

## Quick Start

### Local Development

```bash
# Install dependencies
pip install -r scripts/requirements_model_server.txt

# Run the server
cd /Users/mahirfaisal/Downloads/STAR_PLUS_AI
python scripts/model_server.py
```

Server starts at `http://localhost:8001`

### Docker

```bash
# Build
docker build -t star-plus-model-server -f Dockerfile.model_server .

# Run (mount models directory)
docker run -p 8001:8001 \
  -v /Users/mahirfaisal/Downloads/STAR_PLUS_AI/models:/app/models \
  star-plus-model-server
```

## API Endpoints

### Health & Metadata

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/schema` | GET | Model schema, metadata, feature count |
| `/model-metadata` | GET | Detailed training results |

### Prediction

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predict/health` | POST | Single prediction (PRE_FLIGHT vs POST_FLIGHT) |
| `/predict/all` | POST | Ensemble prediction from all models |
| `/predict/batch` | POST | Batch predictions |
| `/predict/from-influx/{astronaut_id}` | POST | Predict from InfluxDB data |

### Dashboard Integration (astronaut_space_health compatible)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/astronauts` | GET | List astronauts |
| `/influx/health` | GET | InfluxDB health check |
| `/influx/vitals/{astronaut_id}` | GET | Get vitals from InfluxDB |
| `/vitals/latest/{astronaut_id}` | GET | Latest vitals |
| `/predictions/latest/{astronaut_id}` | GET | Latest predictions |
| `/derived/{astronaut_id}` | GET | Derived state |
| `/context/{astronaut_id}` | GET | Context state |
| `/forecast/{astronaut_id}` | GET | Forecast metric |
| `/alerts` | GET | System alerts |
| `/alerts/{astronaut_id}` | GET | Astronaut alerts |

## Request/Response Format

### Prediction Request

```json
POST /predict/health
{
  "astronaut_id": "C001",
  "biomarkers": {
    "subject_id": "C001",
    "age": 45,
    "mission_days": 359,
    "white_blood_cell_count": 5.4,
    "red_blood_cell_count": 4.58,
    "hemoglobin": 14.1,
    "hematocrit": 42.5,
    "mcv": 92.8,
    "mch": 30.8,
    "mchc": 33.2,
    "rdw": 13.0,
    "platelet_count": 241,
    "mpv": 10.3,
    "neutrophils": 43.5,
    "lymphocytes": 41.5,
    "monocytes": 8.9,
    "eosinophils": 4.8,
    "basophils": 1.3,
    "albumin": 4.9,
    "alkaline_phosphatase": 45,
    "alt": 13,
    "ast": 15,
    "total_bilirubin": 1.0,
    "bun_creatinine_ratio": 15,
    "calcium": 9.6,
    "carbon_dioxide": 26,
    "chloride": 102,
    "creatinine": 1.37,
    "egfr": 75,
    "globulin": 2.5,
    "glucose": 69,
    "potassium": 3.9,
    "sodium": 142,
    "total_protein": 7.4
  },
  "model": "random_forest",
  "include_probabilities": true
}
```

### Prediction Response

```json
{
  "astronaut_id": "C001",
  "model_used": "random_forest",
  "prediction": "POST_FLIGHT",
  "confidence": 0.998,
  "probabilities": {
    "PRE_FLIGHT": 0.002,
    "POST_FLIGHT": 0.998
  },
  "risk_level": "LOW",
  "timestamp": "2026-10-04T18:37:14.818710Z",
  "features_used": 11
}
```

### Ensemble Prediction

```json
POST /predict/all
```
Returns majority-vote ensemble prediction with averaged probabilities.

## Models

| Model | Type | CV Accuracy | Features |
|-------|------|-------------|----------|
| Logistic Regression | Pipeline(Imputer + Scaler + LR) | 99.78% ± 0.43% | 685 |
| Random Forest | Pipeline(Imputer + RF) | 99.78% ± 0.43% | 685 |

**Training Data**: NASA OSDR Inspiration4 mission
- OSD-569: Whole Blood / CBC (4 subjects, 7 timepoints)
- OSD-575: Serum CMP + cardiovascular/immune (4 subjects, 600+ biomarkers)
- OSD-656: Urine 200-plex cytokines (4 subjects, 400+ biomarkers)

**Classes**: `PRE_FLIGHT` (L-92, L-44, L-3) vs `POST_FLIGHT` (R+1, R+45, R+82, R+194)

## Feature Mapping

The model expects 685 features from the merged NASA_MASTER_BIOMARKER dataset. The server automatically maps common biomarker names to the model's feature space using the trained imputer's feature names.

Key biomarker categories:
- **CBC (OSD-569)**: WBC, RBC, HGB, HCT, MCV, MCH, MCHC, RDW, PLT, MPV, differentials
- **CMP/Cardio/Immune (OSD-575)**: Albumin, ALP, ALT, AST, Bilirubin, BUN/Cr, Ca, CO2, Cl, Creatinine, eGFR, Globulin, Glucose, K, Na, Total Protein, cytokines
- **Urine (OSD-656)**: 200-plex cytokines (IL-6, IL-8, TNF-α, MCP-1, VEGF, etc.)
- **Demographics**: Age, Mission Days

## Dashboard Integration

The server implements the API contract expected by the `astronaut_space_health` frontend:

```typescript
// Frontend calls these endpoints:
GET /api/v1/health                    // → /health
GET /api/v1/schema                    // → /schema
POST /api/v1/predict/health           // → /predict/health
POST /api/v1/predict/all              // → /predict/all
POST /api/v1/predict/from-influx/:id  // → /predict/from-influx/:id
GET /api/v1/astronauts                // → /astronauts
GET /api/v1/influx/vitals/:id         // → /influx/vitals/:id
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ASTRO_SPACE_MODEL_DIR` | `/app/models` | Directory containing model .pkl files |
| `PORT` | `8001` | Server port |

## Model Files Required

Place in `ASTRO_SPACE_MODEL_DIR`:
- `LogisticRegression_PRE_POST_FLIGHT.pkl`
- `RandomForest_PRE_POST_FLIGHT.pkl`
- `PRE_POST_FLIGHT_CLASSIFICATION_RESULTS.json` (optional, for metadata)

## Performance

- **Latency**: ~5-15ms per prediction
- **Throughput**: 100+ req/s (single worker)
- **Memory**: ~200MB base + model size

## Production Deployment

```yaml
# docker-compose.yml example
services:
  model-server:
    build:
      context: .
      dockerfile: Dockerfile.model_server
    ports:
      - "8001:8001"
    volumes:
      - ./models:/app/models
    environment:
      - ASTRO_SPACE_MODEL_DIR=/app/models
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## License

NASA OSDR data used under NASA open data policy. Model code: MIT.