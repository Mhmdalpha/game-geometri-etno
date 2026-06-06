import { allowCors, getCollection, publicLeaderboardItem, sendJson } from './_mongo.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  try {
    const col = await getCollection();
    const items = await col
      .find({}, { projection: { _id: 0, id: 1, name: 1, className: 1, score: 1, badgeCount: 1, updatedAt: 1 } })
      .sort({ score: -1, updatedAt: -1 })
      .limit(100)
      .toArray();
    sendJson(res, 200, { ok: true, items: items.map(publicLeaderboardItem) });
  } catch (err) {
    sendJson(res, 500, { ok: false, error: err.message });
  }
}
