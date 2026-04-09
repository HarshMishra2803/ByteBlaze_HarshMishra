import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'legal-doc.db');

let db;

function getDb() {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ai_cache (
      hash TEXT PRIMARY KEY,
      response TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// User operations
export function createUser(name, email, passwordHash) {
  const stmt = getDb().prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
  return stmt.run(name, email, passwordHash);
}

export function getUserByEmail(email) {
  const stmt = getDb().prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

export function getUserById(id) {
  const stmt = getDb().prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
  return stmt.get(id);
}

// Document operations
export function saveDocument(userId, type, title, content, language = 'en') {
  const stmt = getDb().prepare('INSERT INTO documents (user_id, type, title, content, language) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(userId, type, title, content, language);
}

export function getDocumentsByUser(userId, limit = 20) {
  const stmt = getDb().prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
  return stmt.all(userId, limit);
}

export function getDocumentById(id, userId) {
  const stmt = getDb().prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?');
  return stmt.get(id, userId);
}

export function getDocumentStats(userId) {
  const total = getDb().prepare('SELECT COUNT(*) as count FROM documents WHERE user_id = ?').get(userId);
  const byType = getDb().prepare('SELECT type, COUNT(*) as count FROM documents WHERE user_id = ? GROUP BY type').all(userId);
  const recent = getDb().prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(userId);
  return { total: total.count, byType, recent };
}

// Chat operations
export function saveChatMessage(userId, role, message) {
  const stmt = getDb().prepare('INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)');
  return stmt.run(userId, role, message);
}

export function getChatHistory(userId, limit = 50) {
  const stmt = getDb().prepare('SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at ASC LIMIT ?');
  return stmt.all(userId, limit);
}

export function clearChatHistory(userId) {
  const stmt = getDb().prepare('DELETE FROM chat_history WHERE user_id = ?');
  return stmt.run(userId);
}

// AI Cache operations
export function getCachedResponse(hash) {
  const stmt = getDb().prepare('SELECT response FROM ai_cache WHERE hash = ?');
  const result = stmt.get(hash);
  return result ? result.response : null;
}

export function setCachedResponse(hash, response) {
  const stmt = getDb().prepare('INSERT OR REPLACE INTO ai_cache (hash, response) VALUES (?, ?)');
  return stmt.run(hash, response);
}

export default getDb;
