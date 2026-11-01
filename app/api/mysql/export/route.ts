import { NextResponse } from 'next/server'
import { fetchAllUsers, generateSqlSchemaScript } from '../../../lib/services/mysql-service'

export async function GET() {
  try {
    const users = await fetchAllUsers()
    const sql = generateSqlSchemaScript(users)

    return new Response(sql, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql; charset=utf-8',
        'Content-Disposition': 'attachment; filename="lemon_users_schema.sql"',
      },
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
