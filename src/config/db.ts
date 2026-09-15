import Database from "better-sqlite3";
import type { Database as DatabaseType } from 'better-sqlite3';

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : 'database.db';
const db: DatabaseType = new Database(dbPath);

if (process.env.NODE_ENV !== 'test') {
    db.pragma('journal_mode = WAL');
}

db.exec(/* sql */`
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price BIGINT NOT NULL CHECK(price > 0),
        category TEXT NOT NULL,
        stock INTEGER NOT NULL CHECK(stock >= 0),
        imageUrl TEXT,
        availableUntil TEXT,
        createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
`);

export default db;