GAME PETUALANGAN BANGUN RUANG: BENTENG & KOTA LAMA - V7 AUDIO + MONGODB + TIMER 2 MENIT

RINGKASAN UPDATE V7
- Setiap goa/mini game memiliki batas waktu 2 menit. Jika waktu habis, game langsung selesai dan skor yang sudah terkumpul otomatis dihitung/disimpan.
- Ada soundtrack saat mulai game/map.
- Ada sound masuk goa yang sama untuk Goa 1, Goa 2, dan Goa 3.
- Musik di dalam Goa 1, Goa 2, dan Goa 3 berbeda.
- Jawaban benar berbunyi ding.
- Jawaban salah berbunyi wrong/buzz.
- Saat masuk soal ke-5 ada sound khusus.
- Saat semua 3 goa selesai ada musik finish.
- Soal dan pilihan jawaban tetap diacak.
- Leaderboard tetap mendukung localStorage + MongoDB Atlas.
- Ditambahkan folder api/ agar lebih siap deploy di Vercel.

KERANGKA FILE

game_petualangan_geometri_v7_audio_mongodb/
├── index.html
├── package.json
├── game-properties.json
├── README.txt
├── src/
│   ├── app.js
│   ├── api-config.js
│   ├── game-data.js
│   └── styles.css
├── assets/
│   ├── background-forest-hd.jpg
│   ├── background-forest.jpg
│   ├── audio/
│   │   ├── start-theme.wav
│   │   ├── cave-enter.wav
│   │   ├── cave-jaring-theme.wav
│   │   ├── cave-ciri-theme.wav
│   │   ├── cave-hitung-theme.wav
│   │   ├── correct-ding.wav
│   │   ├── wrong-buzz.wav
│   │   ├── question-5.wav
│   │   └── finish-theme.wav
│   ├── caves/
│   │   ├── cave-jaring.png
│   │   ├── cave-ciri.png
│   │   └── cave-hitung.png
│   ├── characters/
│   │   └── student-walk.png
│   ├── nets/
│   │   ├── net-balok.svg
│   │   ├── net-bola.svg
│   │   ├── net-kerucut.svg
│   │   ├── net-limas.svg
│   │   ├── net-prisma.svg
│   │   └── net-tabung.svg
│   └── objects/
│       ├── obj-bola-bollard.svg
│       ├── obj-kerucut-lamp.svg
│       ├── obj-limas-roof.svg
│       ├── obj-prisma-fort.svg
│       └── obj-tabung-tank.svg
├── api/
│   ├── _mongo.js
│   ├── health.js
│   ├── leaderboard.js
│   └── players/
│       ├── index.js
│       └── [id].js
└── backend/
    ├── server.js
    ├── package.json
    └── .env.example

FUNGSI AUDIO
- start-theme.wav: musik saat mulai game / map.
- cave-enter.wav: sound saat masuk goa, dipakai sama untuk 3 goa.
- cave-jaring-theme.wav: musik khusus Goa 1 / Game Tebak Jaring-Jaring.
- cave-ciri-theme.wav: musik khusus Goa 2 / Game Tebak Ciri Bangun.
- cave-hitung-theme.wav: musik khusus Goa 3 / Game Hitung.
- correct-ding.wav: efek suara jawaban benar.
- wrong-buzz.wav: efek suara jawaban salah.
- question-5.wav: efek suara saat soal ke-5 muncul.
- finish-theme.wav: musik saat semua 3 goa selesai.

CARA GANTI MUSIK SENDIRI
1. Siapkan file audio baru dengan format .wav atau .mp3.
2. Ganti file di folder assets/audio/ memakai nama file yang sama.
3. Kalau ingin pakai ekstensi .mp3, buka src/app.js lalu ubah nama file pada bagian AUDIO_FILES.

CARA JALANKAN OFFLINE TANPA MONGODB
1. Ekstrak ZIP.
2. Buka index.html di browser.
3. Game tetap jalan, leaderboard tersimpan lokal di browser.
4. Jika muncul status fallback/API belum tersambung, itu normal untuk mode offline.

CARA JALANKAN LOKAL DENGAN BACKEND MONGODB
1. Masuk folder backend.
2. Salin .env.example menjadi .env.
3. Isi MONGODB_URI dengan connection string MongoDB Atlas.
4. Contoh isi .env:

   MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/game_geometri?retryWrites=true&w=majority
   MONGODB_DB=game_geometri
   MONGODB_COLLECTION=players
   CORS_ORIGIN=*

5. Buka terminal di folder backend lalu jalankan:

   npm install
   npm start

6. Cek API:

   http://localhost:3000/api/health

7. Buka index.html dengan Live Server. src/api-config.js otomatis mencoba http://localhost:3000 saat dibuka lokal.

CARA DEPLOY DI VERCEL + MONGODB ATLAS
1. Upload semua isi folder ini ke GitHub.
2. Masuk Vercel, pilih New Project, import repository GitHub tersebut.
3. Di Vercel, buka Settings → Environment Variables.
4. Tambahkan:

   Name  : MONGODB_URI
   Value : mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/game_geometri?retryWrites=true&w=majority

5. Tambahkan juga opsional:

   MONGODB_DB=game_geometri
   MONGODB_COLLECTION=players

6. Deploy / Redeploy.
7. Buka link Vercel.
8. Karena ada folder api/, src/api-config.js otomatis memakai domain Vercel yang sama. Frontend akan memanggil endpoint /api/leaderboard dan /api/players pada domain Vercel itu.

CATATAN PENTING AUDIO
- Browser biasanya baru mengizinkan audio setelah ada klik pertama dari user.
- Karena itu musik mulai saat tombol Mulai Petualangan diklik.
- Ada tombol 🔊/🔇 di kanan atas map untuk mute/unmute.

CATATAN TIMER
- Timer berada di baris info mini game, di sebelah teks Soal 1/5 dan Skor game.
- Setiap goa diberi waktu 2 menit, dihitung mundur dari 02:00.
- Saat waktu tersisa 10 detik, warna timer berubah merah.
- Jika waktu habis sebelum 5 soal selesai, mini game langsung ditutup, skor sementara tetap dihitung, lalu pemain kembali ke map.

CATATAN KEAMANAN
- Game ini dibuat untuk have fun, jadi tombol hapus leaderboard belum pakai login admin.
- Jangan upload file .env yang berisi password MongoDB ke GitHub.
- Jika connection string pernah terlihat publik, ganti password database user di MongoDB Atlas.

UPDATE V9 AUDIO MP3:
- Semua audio sekarang memakai format .mp3, bukan .wav.
- Kalau ingin mengganti musik sendiri, masukkan file MP3 ke folder assets/audio/ dengan nama yang sama:
  start-theme.mp3
  cave-enter.mp3
  cave-jaring-theme.mp3
  cave-ciri-theme.mp3
  cave-hitung-theme.mp3
  correct-ding.mp3
  wrong-buzz.mp3
  question-5.mp3
  finish-theme.mp3
