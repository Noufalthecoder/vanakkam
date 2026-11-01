import { NextRequest, NextResponse } from 'next/server'

interface ApplyRequestBody {
  imageBase64: string
  lipstickColorHex?: string
  lipstickFinish?: 'matte' | 'satin' | 'gloss' | 'shimmer'
  blushColorHex?: string
  blushIntensity?: number
  eyeshadowColorHex?: string
  foundationTone?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ApplyRequestBody = await req.json()

    if (!body || !body.imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing facial image. Please provide a valid base64-encoded image string.',
        },
        { status: 400 }
      )
    }

    // Validate image format and payload size (max 10MB)
    const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const approxSizeBytes = (base64Data.length * 3) / 4

    if (approxSizeBytes > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image file size exceeds the 10 MB limit. Please compress or select a smaller image.',
        },
        { status: 413 }
      )
    }

    // Resolve YouCam App ID and API credentials
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

    // If neither YouCam App ID nor API Key is configured in environment
    if (!appId && !apiKey) {
      return NextResponse.json(
        {
          success: false,
          apiUsed: 'ucam_cloud',
          error:
            'YouCam API credentials (YOUCAM_APP_ID / UCAM_API_KEY) are not configured in the backend environment. Please set your YouCam App ID or API key in lemon-ui/.env.local to enable live cloud processing.',
          requiresCredentials: true,
          configured: false,
        },
        { status: 503 }
      )
    }

    // Call upstream Perfect Corp YouCam Cloud API
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Client-Version': 'Lemon-AI/1.0',
      }

      // Add credential auth
      const primaryCredential = apiKey || appId
      if (primaryCredential) {
        headers['Authorization'] = `Bearer ${primaryCredential}`
        headers['X-API-KEY'] = primaryCredential
      }

      // Add client/app ID headers
      if (appId) {
        headers['X-Client-Id'] = appId
        headers['X-App-Id'] = appId
      }

      const requestPayload: Record<string, any> = {
        image: base64Data,
        effects: {
          lip_color: body.lipstickColorHex || '#C94B5A',
          lip_texture: body.lipstickFinish || 'satin',
          blush_color: body.blushColorHex || '#E68A7E',
          blush_intensity: body.blushIntensity ?? 70,
          eyeshadow_color: body.eyeshadowColorHex || '#B8860B',
          foundation_tone: body.foundationTone || 'natural',
        },
      }

      if (appId) {
        requestPayload.app_id = appId
        requestPayload.client_id = appId
      }

      const ucamResponse = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (ucamResponse.status === 401 || ucamResponse.status === 403) {
        const errorText = await ucamResponse.text()
        return NextResponse.json(
          {
            success: false,
            apiUsed: 'ucam_cloud',
            error: `Authentication failed with YouCam API (Status ${ucamResponse.status}). Please check your YOUCAM_APP_ID / YOUCAM_API_KEY in .env.local: ${errorText || ucamResponse.statusText}`,
          },
          { status: ucamResponse.status }
        )
      }

      if (ucamResponse.status === 429) {
        const retryAfter = ucamResponse.headers.get('Retry-After') || '60'
        return NextResponse.json(
          {
            success: false,
            apiUsed: 'ucam_cloud',
            error: `YouCam API rate limit reached. Please wait ${retryAfter} seconds before retrying.`,
            retryAfterSeconds: parseInt(retryAfter, 10),
          },
          { status: 429 }
        )
      }

      if (!ucamResponse.ok) {
        const errorText = await ucamResponse.text()
        return NextResponse.json(
          {
            success: false,
            apiUsed: 'ucam_cloud',
            error: `YouCam API returned error status ${ucamResponse.status}: ${errorText || ucamResponse.statusText}`,
          },
          { status: ucamResponse.status }
        )
      }

      const result = await ucamResponse.json()
      const processedImage =
        result.processed_image ||
        result.image_url ||
        result.data?.image ||
        result.data?.processed_image ||
        result.result_image ||
        result.output_image ||
        result.image

      return NextResponse.json({
        success: true,
        apiUsed: 'ucam_cloud',
        processedImageBase64: processedImage,
        message: 'Virtual makeup applied successfully via Perfect Corp YouCam Cloud API.',
      })
    } catch (networkErr: any) {
      clearTimeout(timeout)
      if (networkErr.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            apiUsed: 'ucam_cloud',
            error: 'Connection to YouCam API timed out after 15 seconds. Please check your network connection and retry.',
          },
          { status: 504 }
        )
      }
      return NextResponse.json(
        {
          success: false,
          apiUsed: 'ucam_cloud',
          error: `Network error connecting to YouCam API: ${networkErr.message || 'Connection refused'}`,
        },
        { status: 502 }
      )
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid request payload or server error: ${err.message}`,
      },
      { status: 500 }
    )
  }
}
