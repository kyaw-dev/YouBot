// Database initialization
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../../storage/youbot.db');

let db = null;

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export async function initDatabase() {
  // Skip for Vercel serverless (no filesystem)
  if (process.env.VERCEL === '1') {
    console.log('📦 Vercel environment - using in-memory fallback');
    return { mock: true };
  }
  
  // Dynamic import for better-sqlite3
  const Database = (await import('better-sqlite3')).default;
  
  // Ensure storage directory exists
  const storageDir = path.join(__dirname, '../../storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  
  // Open database
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  
  // Run migrations
  await runMigrations();
  
  return db;
}

async function runMigrations() {
  // Models table
  db.exec(`
    CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      filename TEXT NOT NULL,
      format TEXT NOT NULL,
      size INTEGER,
      path TEXT,
      status TEXT DEFAULT 'available',
      uploadedAt TEXT,
      updatedAt TEXT
    )
  `);
  
  // Chats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      history TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);
  
  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
  
  console.log('Database migrations complete');
}

export async function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

export default { getDb, initDatabase, closeDatabase };