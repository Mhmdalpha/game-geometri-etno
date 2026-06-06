import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'game_geometri';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || 'players';

let cachedClient;
let cachedCollection;
let cachedPromise;

export function makePlayerId(name = 'Penjelajah', className = '-') {
  return `${String(name || 'Penjelajah').trim().toLowerCase()}__${String(className || '-').trim().toLowerCase()}`
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_\-]/g, '');
}

export async function getCollection() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI belum diisi di Environment Variables Vercel.');
  if (cachedCollection) return cachedCollection;
  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    cachedPromise = cachedClient.connect();
  }
  await cachedPromise;
  cachedCollection = cachedClient.db(DB_NAME).collection(COLLECTION_NAME);
  await cachedCollection.createIndex({ id: 1 }, { unique: true });
  await cachedCollection.createIndex({ score: -1, updatedAt: -1 });
  return cachedCollection;
}

export function normalizeProgress(input = {}) {
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

export function publicPlayer(doc) {
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

export function publicLeaderboardItem(doc) {
  return {
    id: doc.id,
    name: doc.name,
    className: doc.className,
    score: Number(doc.score) || 0,
    badgeCount: Number(doc.badgeCount) || 0,
    updatedAt: doc.updatedAt
  };
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function allowCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}
