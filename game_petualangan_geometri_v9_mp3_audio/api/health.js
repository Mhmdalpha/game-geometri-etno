import { allowCors, getCollection, sendJson } from './_mongo.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  try {
    const col = await getCollection();
    await col.findOne({}, { projection: { _id: 1 } });
    sendJson(res, 200, { ok: true, database: process.env.MONGODB_DB || 'game_geometri', collection: process.env.MONGODB_COLLECTION || 'players' });
  } catch (err) {
    sendJson(res, 500, { ok: false, error: err.message });
  }
}
