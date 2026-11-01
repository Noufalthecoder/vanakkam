import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

export interface UserRecord {
  id?: number
  name: string
  email: string
  occasion?: string
  style?: string
  finish?: string
  lipstick_shade?: string
  blush_shade?: string
  eyeshadow_shade?: string
  budget_inr?: number
  experience_level?: string
  concerns?: string
  notes?: string
  created_at?: string
  source?: 'mysql' | 'local_fallback'
}

const FALLBACK_DIR = path.join(process.cwd(), 'data')
const FALLBACK_FILE = path.join(FALLBACK_DIR, 'mysql-fallback-users.json')

function ensureFallbackFileExists() {
  if (!fs.existsSync(FALLBACK_DIR)) {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true })
  }
  if (!fs.existsSync(FALLBACK_FILE)) {
    const initialRecords: UserRecord[] = [
      {
        id: 1,
        name: 'Ananya Sharma',
        email: 'ananya.sharma@example.com',
        occasion: 'Bridal',
        style: 'Traditional',
        finish: 'Satin',
        lipstick_shade: '#A81C28 (Ruby Woo Red)',
        blush_shade: '#E68A7E (Soft Coral Peach)',
        eyeshadow_shade: '#D4AF37 (Champagne Gold)',
        budget_inr: 8500,
        experience_level: 'Beginner',
        concerns: 'Under-eye dark circles, uneven tone',
        notes: 'Requested flash-photography safe setting powder.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        source: 'local_fallback',
      },
      {
        id: 2,
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        occasion: 'Reception',
        style: 'Soft Glam',
        finish: 'Gloss',
        lipstick_shade: '#BA5641 (Toasted Terracotta)',
        blush_shade: '#D27D66 (Warm Terracotta)',
        eyeshadow_shade: '#C67D5A (Burnished Copper)',
        budget_inr: 5000,
        experience_level: 'Intermediate',
        concerns: 'Visible redness on cheeks',
        notes: 'Outfit is emerald green lehenga.',
        created_at: new Date().toISOString(),
        source: 'local_fallback',
      },
    ]
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(initialRecords, null, 2), 'utf-8')
  }
}

function readFallbackRecords(): UserRecord[] {
  ensureFallbackFileExists()
  try {
    const raw = fs.readFileSync(FALLBACK_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeFallbackRecords(records: UserRecord[]) {
  ensureFallbackFileExists()
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(records, null, 2), 'utf-8')
}

async function getPool(): Promise<mysql.Pool | null> {
  const host = process.env.MYSQL_HOST || 'localhost'
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10)
  const user = process.env.MYSQL_USER || 'root'
  const password = process.env.MYSQL_PASSWORD || ''
  const database = process.env.MYSQL_DATABASE || 'lemon_makeup_db'

  try {
    const pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 2000,
    })

    // Test ping
    const connection = await pool.getConnection()
    connection.release()
    return pool
  } catch {
    return null
  }
}

export async function initMysqlTables() {
  const pool = await getPool()
  if (!pool) return false

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lemon_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        occasion VARCHAR(100),
        style VARCHAR(100),
        finish VARCHAR(50),
        lipstick_shade VARCHAR(50),
        blush_shade VARCHAR(50),
        eyeshadow_shade VARCHAR(50),
        budget_inr DECIMAL(10,2),
        experience_level VARCHAR(50),
        concerns TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    return true
  } catch (err) {
    console.warn('MySQL table initialization error:', err)
    return false
  }
}

export async function checkMysqlConnection() {
  const host = process.env.MYSQL_HOST || 'localhost'
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10)
  const user = process.env.MYSQL_USER || 'root'
  const database = process.env.MYSQL_DATABASE || 'lemon_makeup_db'

  try {
    const pool = await getPool()
    if (pool) {
      await initMysqlTables()
      const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM lemon_users')
      return {
        connected: true,
        mode: 'mysql_live',
        host,
        port,
        user,
        database,
        tableName: 'lemon_users',
        recordCount: rows[0]?.count || 0,
        message: `Successfully connected to live MySQL database (${database}) on ${host}:${port}`,
      }
    }
  } catch (err: any) {
    // Falls through to fallback
  }

  const fallbackData = readFallbackRecords()
  return {
    connected: false,
    mode: 'local_fallback',
    host,
    port,
    user,
    database,
    tableName: 'lemon_users (Emulated)',
    recordCount: fallbackData.length,
    message: `MySQL server offline at ${host}:${port}. Data is being safely saved in Local Fallback Storage. All features are fully functional.`,
  }
}

export async function fetchAllUsers(): Promise<UserRecord[]> {
  const pool = await getPool()
  if (pool) {
    try {
      await initMysqlTables()
      const [rows]: any = await pool.query('SELECT * FROM lemon_users ORDER BY id DESC')
      return rows.map((r: any) => ({
        ...r,
        source: 'mysql' as const,
      }))
    } catch (err) {
      console.warn('MySQL read error, falling back to local file storage:', err)
    }
  }

  return readFallbackRecords()
}

export async function insertUser(user: UserRecord): Promise<UserRecord> {
  const pool = await getPool()
  if (pool) {
    try {
      await initMysqlTables()
      const [res]: any = await pool.query(
        `INSERT INTO lemon_users 
        (name, email, occasion, style, finish, lipstick_shade, blush_shade, eyeshadow_shade, budget_inr, experience_level, concerns, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.name,
          user.email,
          user.occasion || null,
          user.style || null,
          user.finish || null,
          user.lipstick_shade || null,
          user.blush_shade || null,
          user.eyeshadow_shade || null,
          user.budget_inr || 0,
          user.experience_level || 'Beginner',
          user.concerns || '',
          user.notes || '',
        ]
      )
      return {
        ...user,
        id: res.insertId,
        created_at: new Date().toISOString(),
        source: 'mysql',
      }
    } catch (err) {
      console.warn('MySQL insert failed, saving to local fallback storage:', err)
    }
  }

  const records = readFallbackRecords()
  const newRecord: UserRecord = {
    ...user,
    id: Date.now(),
    created_at: new Date().toISOString(),
    source: 'local_fallback',
  }
  records.unshift(newRecord)
  writeFallbackRecords(records)
  return newRecord
}

export async function deleteUserById(id: number): Promise<boolean> {
  const pool = await getPool()
  if (pool) {
    try {
      await pool.query('DELETE FROM lemon_users WHERE id = ?', [id])
      return true
    } catch (err) {
      console.warn('MySQL delete error:', err)
    }
  }

  const records = readFallbackRecords()
  const filtered = records.filter((r) => r.id !== id)
  writeFallbackRecords(filtered)
  return true
}

export function generateSqlSchemaScript(records: UserRecord[]): string {
  const dbName = process.env.MYSQL_DATABASE || 'lemon_makeup_db'

  let sql = `-- ========================================================
-- LEMON AI MAKEUP ASSISTANT - MYSQL DATABASE SCHEMA & DUMP
-- Generated on: ${new Date().toISOString()}
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`${dbName}\`;

DROP TABLE IF EXISTS \`lemon_users\`;
CREATE TABLE \`lemon_users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL,
  \`occasion\` VARCHAR(100),
  \`style\` VARCHAR(100),
  \`finish\` VARCHAR(50),
  \`lipstick_shade\` VARCHAR(50),
  \`blush_shade\` VARCHAR(50),
  \`eyeshadow_shade\` VARCHAR(50),
  \`budget_inr\` DECIMAL(10,2),
  \`experience_level\` VARCHAR(50),
  \`concerns\` TEXT,
  \`notes\` TEXT,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`

  if (records.length > 0) {
    sql += `-- INSERT SAMPLE / STORED RECORDS\n`
    for (const r of records) {
      const escape = (val: any) => (val ? `'${String(val).replace(/'/g, "\\'")}'` : 'NULL')
      sql += `INSERT INTO \`lemon_users\` (\`name\`, \`email\`, \`occasion\`, \`style\`, \`finish\`, \`lipstick_shade\`, \`blush_shade\`, \`eyeshadow_shade\`, \`budget_inr\`, \`experience_level\`, \`concerns\`, \`notes\`) VALUES (${escape(r.name)}, ${escape(r.email)}, ${escape(r.occasion)}, ${escape(r.style)}, ${escape(r.finish)}, ${escape(r.lipstick_shade)}, ${escape(r.blush_shade)}, ${escape(r.eyeshadow_shade)}, ${r.budget_inr || 0}, ${escape(r.experience_level)}, ${escape(r.concerns)}, ${escape(r.notes)});\n`
    }
  }

  return sql
}
