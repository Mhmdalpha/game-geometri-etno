import { allowCors, getCollection, publicPlayer, sendJson } from '../_mongo.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const col = await getCollection();
    if (req.method === 'GET') {
      const player = await col.findOne({ id }, { projection: { _id: 0 } });
      return sendJson(res, 200, { ok: true, player: publicPlayer(player) });
    }
    if (req.method === 'DELETE') {
      const result = await col.deleteOne({ id });
      return sendJson(res, 200, { ok: true, deletedCount: result.deletedCount });
    }
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (err) {
    sendJson(res, 500, { ok: false, error: err.message });
  }
}
