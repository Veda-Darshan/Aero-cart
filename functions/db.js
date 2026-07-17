// functions/db.js
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file will be created in the functions directory
const dbPath = path.resolve(__dirname, "hyperlocal.db");
const db = new Database(dbPath);

// Initialize tables if they don't exist
const init = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      imageUrl TEXT,
      stock INTEGER DEFAULT 0,
      category TEXT,
      weight REAL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      items TEXT NOT NULL, -- JSON array of {productId, quantity, price}
      total REAL NOT NULL,
      address TEXT,
      paymentMethod TEXT,
      status TEXT DEFAULT 'Pending',
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      rating INTEGER,
      comment TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(orderId) REFERENCES orders(id)
    );
  `);
};

init();

export default db;
