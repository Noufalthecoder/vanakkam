import { NextResponse } from 'next/server'

export async function GET() {
  const appId =
    process.env.YOUCAM_APP_ID ||
    process.env.YOUCAM_CLIENT_ID ||
    process.env.UCAM_APP_ID ||
    process.env.UCAM_CLIENT_ID ||
    process.env.YOUCAM_ID ||
    ''

  const apiKey =
    process.env.YOUCAM_API_KEY ||
    process.env.YOUCAM_SECRET_KEY ||
    process.env.UCAM_API_KEY ||
    process.env.PERFECTCORP_API_KEY ||
    ''

  const apiUrl =
    process.env.YOUCAM_API_URL ||
    process.env.UCAM_API_URL ||
    'https://yce-api.perfectcorp.com/v1/makeup/apply'

  const configured = Boolean(appId || apiKey)

  const maskedId = appId
    ? appId.length > 8
      ? `${appId.slice(0, 4)}...${appId.slice(-4)}`
      : '****'
    : null

  const maskedKey = apiKey
    ? apiKey.length > 8
      ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
      : '****'
    : null

  return NextResponse.json({
    service: 'Perfect Corp UCam Virtual Try-On API Gateway',
    configured,
    hasAppId: Boolean(appId),
    hasApiKey: Boolean(apiKey),
    appIdMasked: maskedId,
    apiKeyMasked: maskedKey,
    endpoint: apiUrl,
    supportedEffects: [
      'lip_color',
      'lip_finish (matte, satin, gloss, shimmer)',
      'blush',
      'eye_shadow',
      'foundation_tone',
    ],
    missingRequirements: configured
      ? []
      : [
          'YOUCAM_APP_ID in environment (.env.local or .env)',
          'YOUCAM_API_KEY (optional, depending on tier)',
        ],
    serverTime: new Date().toISOString(),
  })
}
