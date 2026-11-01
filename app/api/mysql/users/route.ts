import { NextRequest, NextResponse } from 'next/server'
import {
  fetchAllUsers,
  insertUser,
  deleteUserById,
  UserRecord,
} from '../../../lib/services/mysql-service'

export async function GET() {
  try {
    const users = await fetchAllUsers()
    return NextResponse.json({
      success: true,
      count: users.length,
      users,
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

export async function POST(req: NextRequest) {
  try {
    const body: UserRecord = await req.json()

    if (!body || !body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and Email are required fields to store user data in MySQL.',
        },
        { status: 400 }
      )
    }

    const created = await insertUser(body)
    return NextResponse.json({
      success: true,
      message: 'User data saved successfully.',
      user: created,
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '', 10)

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid numeric record ID is required to delete.',
        },
        { status: 400 }
      )
    }

    await deleteUserById(id)
    return NextResponse.json({
      success: true,
      message: `User record #${id} removed successfully.`,
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
