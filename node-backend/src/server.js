import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/aethervault";
let mongoStatus = "connecting";

mongoose.connection.on("connected", () => {
  mongoStatus = "connected";
  console.log("MongoDB connected");
});

mongoose.connection.on("error", error => {
  mongoStatus = "error";
  console.error("MongoDB connection error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  mongoStatus = "disconnected";
});

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10000,
  tls: true
}).catch(error => {
  mongoStatus = "error";
  console.error("MongoDB initial connection failed:", error.message);
});

const embeddingSchema = new mongoose.Schema({
  documentId: { type: Number, required: true, unique: true },
  title: String,
  description: String,
  category: String,
  embedding: [Number],
  updatedAt: { type: Date, default: Date.now }
});

const historySchema = new mongoose.Schema({
  query: String,
  type: String,
  results: Number,
  createdAt: { type: Date, default: Date.now }
});

const DocumentEmbedding = mongoose.model("DocumentEmbedding", embeddingSchema, "document_embeddings");
const SearchHistory = mongoose.model("SearchHistory", historySchema, "search_history");

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function embed(text) {
  return new Promise((resolve, reject) => {
    const python = spawn(process.env.PYTHON_BIN || "python", ["src/embed.py"], {
      cwd: projectRoot
    });
    let output = "";
    let error = "";
    python.stdout.on("data", data => {
      output += data.toString();
    });
    python.stderr.on("data", data => {
      error += data.toString();
    });
    python.on("close", code => {
      if (code !== 0) {
        reject(new Error(error || `Embedding process exited with code ${code}`));
        return;
      }
      resolve(JSON.parse(output));
    });
    python.stdin.write(JSON.stringify({ text }));
    python.stdin.end();
  });
}

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    mongodb: mongoStatus,
    readyState: mongoose.connection.readyState
  });
});

function requireMongo(_req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message: "MongoDB is not connected yet",
      mongodb: mongoStatus
    });
    return;
  }
  next();
}

app.post("/internal/documents/index", requireMongo, async (req, res, next) => {
  try {
    const { documentId, title, description, category } = req.body;
    const text = `${title || ""} ${description || ""}`.trim();
    const vector = await embed(text);
    const doc = await DocumentEmbedding.findOneAndUpdate(
      { documentId },
      { documentId, title, description, category, embedding: vector, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (error) {
    next(error);
  }
});

app.delete("/internal/documents/:id", requireMongo, async (req, res, next) => {
  try {
    await DocumentEmbedding.deleteOne({ documentId: Number(req.params.id) });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/search", requireMongo, async (req, res, next) => {
  try {
    const q = String(req.query.q || "");
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const results = await DocumentEmbedding.find({
      $or: [{ title: regex }, { description: regex }, { category: regex }]
    }).limit(20);
    await SearchHistory.create({ query: q, type: "keyword", results: results.length });
    res.json(results.map(doc => ({
      documentId: doc.documentId,
      title: doc.title,
      description: doc.description,
      category: doc.category
    })));
  } catch (error) {
    next(error);
  }
});

app.post("/search/semantic", requireMongo, async (req, res, next) => {
  try {
    const query = String(req.body.query || "");
    const queryVector = await embed(query);
    const docs = await DocumentEmbedding.find({});
    const results = docs
      .map(doc => ({
        documentId: doc.documentId,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        score: cosineSimilarity(queryVector, doc.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(req.body.limit || 10));
    await SearchHistory.create({ query, type: "semantic", results: results.length });
    res.json(results);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Search service error" });
});

app.listen(port, () => {
  console.log(`AetherVault search service running on ${port}`);
});
