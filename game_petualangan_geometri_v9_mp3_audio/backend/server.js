import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'game_geometri';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || 'players';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

if (!MONGODB_URI) {
  console.warn('PERINGATAN: MONGODB_URI belum diisi. Salin .env.example menjadi .env lalu isi connection string MongoDB Atlas.');
}

app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map(s => s.trim()) }));
app.use(express.json({ limit: '1mb' }));

let client;
let collection;

function makePlayerId(name = 'Penjelajah', className = '-') {
  return `${String(name || 'Penjelajah').trim().toLowerCase()}__${String(className || '-').trim().toLowerCase()}`
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_\-]/g, '');
}

async function getCollection() {
  if (collection) return collection;
  if (!MONGODB_URI) throw new Error('MONGODB_URI belum diisi');
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  collection = client.db(DB_NAME).collection(COLLECTION_NAME);
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ score: -1, updatedAt: -1 });
  return collection;
}

function normalizeProgress(input = {}) {
  const name = String(input.name || input.nama || 'Penjelajah').trim().slice(0, 64) || 'Penjelajah';
  const className = String(input.className || input.kelas || '-').trim().slice(0, 32) || '-';
  const id = String(input.id || makePlayerId(name, className)).trim();
  const games = input.games && typeof input.games === 'object' ? input.games : {};
  const badgeCount = Object.values(games).filter(g => g && g.finished).length;
  return {
    id,
    name,
    className,
    score: Number(input.score) || 0,
    games,
    badgeCount,
    updatedAt: new Date().toISOString()
  };
}

function publicPlayer(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    name: doc.name,
    className: doc.className,
    score: Number(doc.score) || 0,
    games: doc.games || {},
    badgeCount: Number(doc.badgeCount) || 0,
    updatedAt: doc.updatedAt
  };
}

function publicLeaderboardItem(doc) {
  return {
    id: doc.id,
    name: doc.name,
    className: doc.className,
    score: Number(doc.score) || 0,
    badgeCount: Number(doc.badgeCount) || 0,
    updatedAt: doc.updatedAt
  };
}

app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'API Leaderboard Game Geometri aktif', endpoints: ['/api/health', '/api/leaderboard', '/api/players'] });
});

app.get('/api/health', async (_req, res) => {
  try {
    const col = await getCollection();
    await col.findOne({}, { projection: { _id: 1 } });
    res.json({ ok: true, database: DB_NAME, collection: COLLECTION_NAME });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/leaderboard', async (_req, res) => {
  try {
    const col = await getCollection();
    const items = await col
      .find({}, { projection: { _id: 0, id: 1, name: 1, className: 1, score: 1, badgeCount: 1, updatedAt: 1 } })
      .sort({ score: -1, updatedAt: -1 })
      .limit(100)
      .toArray();
    res.json({ ok: true, items: items.map(publicLeaderboardItem) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/players/:id', async (req, res) => {
  try {
    const col = await getCollection();
    const player = await col.findOne({ id: req.params.id }, { projection: { _id: 0 } });
    res.json({ ok: true, player: publicPlayer(player) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const col = await getCollection();
    const player = normalizeProgress(req.body);
    await col.updateOne(
      { id: player.id },
      { $set: player, $setOnInsert: { createdAt: new Date().toISOString() } },
      { upsert: true }
    );
    res.json({ ok: true, player });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/players/:id', async (req, res) => {
  try {
    const col = await getCollection();
    const result = await col.deleteOne({ id: req.params.id });
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/players', async (_req, res) => {
  try {
    const col = await getCollection();
    const result = await col.deleteMany({});
    res.json({ ok: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Endpoint tidak ditemukan: ${req.method} ${req.path}` });
});

process.on('SIGINT', async () => {
  if (client) await client.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`API Game Geometri berjalan di http://localhost:${PORT}`);
});
