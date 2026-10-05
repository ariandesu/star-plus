import { nasaMlEngine } from './services/nasaMlEngine';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '');

    // CORS preflight handling
    if (request.method === 'OPTIONS' && pathname.startsWith('/api/ml')) {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (pathname.startsWith('/api/ml')) {
      try {
        // GET /api/ml/health
        if (request.method === 'GET' && pathname === '/api/ml/health') {
          return jsonResponse({
            status: 'healthy',
            service: 'STAR+ NASA OSDR Model API (Cloudflare Worker Edge)',
            version: '1.0.0-edge',
            engine: 'cloudflare-worker-edge',
            models_loaded: [
              'LogisticRegression_PRE_POST_FLIGHT',
              'RandomForest_PRE_POST_FLIGHT',
              'Ensemble_Hybrid',
            ],
            timestamp: new Date().toISOString(),
            cloud: 'Cloudflare Edge Serverless (24/7 Global)',
          });
        }

        // GET /api/ml/models
        if (request.method === 'GET' && pathname === '/api/ml/models') {
          return jsonResponse({
            metadata: nasaMlEngine.getMetadata(),
            feature_importances: nasaMlEngine.getFeatureImportances(),
            timestamp: new Date().toISOString(),
          });
        }

        // POST /api/ml/predict
        if (request.method === 'POST' && pathname === '/api/ml/predict') {
          const body = (await request.json()) as any;
          const biomarkers = body.biomarkers || body.features || body;
          const modelName = body.model || body.model_name || 'ensemble';

          const result = nasaMlEngine.predict(biomarkers, modelName);
          return jsonResponse(result);
        }

        // POST /api/ml/predict/health
        if (request.method === 'POST' && pathname === '/api/ml/predict/health') {
          const body = (await request.json()) as any;
          const astronautId = body.astronaut_id || body.subject_id || body.id || 'ASTRONAUT-01';
          const biomarkers = body.features || body.biomarkers || body;
          const modelName = body.model_name || body.model || 'ensemble';

          const result = nasaMlEngine.predict(biomarkers, modelName);
          return jsonResponse({
            astronaut_id: astronautId,
            status: 'success',
            prediction: result.prediction,
            confidence: result.confidence,
            probabilities: result.probabilities,
            risk_level: result.riskLevel,
            timestamp: result.timestamp,
            engine_source: 'CLOUDFLARE_WORKER_EDGE',
            features_used: result.featuresUsed,
            top_biomarker_contributions: result.topBiomarkerContributions,
            result,
          });
        }

        // POST /api/ml/predict/all
        if (request.method === 'POST' && pathname === '/api/ml/predict/all') {
          const body = (await request.json()) as any;
          const astronautId = body.astronaut_id || body.subject_id || body.id || 'ASTRONAUT-01';
          const biomarkers = body.biomarkers || body.features || body;

          const lrResult = nasaMlEngine.predict(biomarkers, 'logistic_regression');
          const rfResult = nasaMlEngine.predict(biomarkers, 'random_forest');
          const ensembleResult = nasaMlEngine.predict(biomarkers, 'ensemble');

          return jsonResponse({
            astronaut_id: astronautId,
            prediction: ensembleResult.prediction,
            confidence: ensembleResult.confidence,
            probabilities: ensembleResult.probabilities,
            risk_level: ensembleResult.riskLevel,
            timestamp: ensembleResult.timestamp,
            features_used: ensembleResult.featuresUsed,
            top_biomarker_contributions: ensembleResult.topBiomarkerContributions,
            models: {
              logistic_regression: lrResult,
              random_forest: rfResult,
              ensemble: ensembleResult,
            },
          });
        }

        return jsonResponse({ error: 'Endpoint not found' }, 404);
      } catch (err: any) {
        return jsonResponse(
          { error: 'ML Engine processing error', message: err.message || String(err) },
          500
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
