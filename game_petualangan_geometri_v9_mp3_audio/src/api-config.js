// Konfigurasi API leaderboard MongoDB.
// - Lokal/Live Server: mencoba backend Express di http://localhost:3000.
// - Vercel: memakai domain yang sama, misalnya https://project.vercel.app/api/...
// - Offline/localStorage saja: ganti baris terakhir menjadi window.GAME_API_BASE = "";
const IS_LOCAL_HOST = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
window.GAME_API_BASE = IS_LOCAL_HOST ? "http://localhost:3000" : window.location.origin;
