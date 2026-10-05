import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'STAR+ NASA OSDR Model API (Local Engine)',
    version: '1.0.0-edge',
    engine: 'local-edge',
    models_loaded: [
      'LogisticRegression_PRE_POST_FLIGHT',
      'RandomForest_PRE_POST_FLIGHT',
      'Ensemble_Hybrid',
    ],
    timestamp: new Date().toISOString(),
    cloud: 'Local Edge Inference',
  });
}
