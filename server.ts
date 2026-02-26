import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("neurostudy.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT,
    filename TEXT,
    content TEXT,
    metadata TEXT
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/upload", (req, res) => {
    const { subject, filename, content } = req.body;
    const stmt = db.prepare("INSERT INTO documents (subject, filename, content) VALUES (?, ?, ?)");
    stmt.run(subject, filename, content);
    res.json({ success: true });
  });

  app.get("/api/documents/:subject", (req, res) => {
    const { subject } = req.params;
    const docs = db.prepare("SELECT id, filename, content FROM documents WHERE subject = ?").all(subject);
    res.json(docs);
  });

  app.get("/api/search", (req, res) => {
    const { q, subject } = req.query;
    if (!q) return res.json([]);
    const query = `%${q}%`;
    const docs = db.prepare("SELECT id, filename, content FROM documents WHERE subject = ? AND (filename LIKE ? OR content LIKE ?)").all(subject, query, query);
    res.json(docs);
  });

  app.get("/api/notes/:subject", (req, res) => {
    const { subject } = req.params;
    const notes = db.prepare("SELECT * FROM notes WHERE subject = ? ORDER BY created_at DESC").all(subject);
    res.json(notes);
  });

  app.post("/api/notes", (req, res) => {
    const { subject, title, content } = req.body;
    const stmt = db.prepare("INSERT INTO notes (subject, title, content) VALUES (?, ?, ?)");
    const info = stmt.run(subject, title, content);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/notes/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM notes WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Gemini logic moved to frontend as per platform guidelines
  app.post("/api/chat", async (req, res) => {
    res.status(410).json({ error: "Endpoint moved to frontend" });
  });

  app.post("/api/study", async (req, res) => {
    res.status(410).json({ error: "Endpoint moved to frontend" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
