import { NextResponse } from 'next/server'
import { checkMysqlConnection } from '../../../lib/services/mysql-service'

export async function GET() {
  try {
    const status = await checkMysqlConnection()
    return NextResponse.json({
      success: true,
      ...status,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    )
  }
}
