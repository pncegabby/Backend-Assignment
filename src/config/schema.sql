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