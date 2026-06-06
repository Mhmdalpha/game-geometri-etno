import { allowCors, getCollection, normalizeProgress, sendJson } from '../_mongo.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  try {
    const col = await getCollection();
    if (req.method === 'POST') {
      const player = normalizeProgress(req.body || {});
      await col.updateOne(
        { id: player.id },
        { $set: player, $setOnInsert: { createdAt: new Date().toISOString() } },
        { upsert: true }
      );
      return sendJson(res, 200, { ok: true, player });
    }
    if (req.method === 'DELETE') {
      const result = await col.deleteMany({});
      return sendJson(res, 200, { ok: true, deletedCount: result.deletedCount });
    }
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (err) {
    sendJson(res, 500, { ok: false, error: err.message });
  }
}
