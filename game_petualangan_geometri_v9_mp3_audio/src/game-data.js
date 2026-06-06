/*
  Data game dapat diedit di file ini.
  Setiap soal punya: question, image, options, correct, explanation.
*/
const GAME_DATA = {
  title: "Petualangan Bangun Ruang: Benteng & Kota Lama",
  scoring: {
    correct: 10,
    wrong: 0,
    badgePerFinishedGame: true
  },
  caves: [
    {
      id: "jaring",
      title: "Game 1: Tebak Jaring-Jaring",
      shortTitle: "Jaring-Jaring",
      badge: "Badge Jaring",
      caveImage: "assets/caves/cave-jaring.png",
      x: 18,
      y: 68,
      description: "Pilih jaring-jaring yang sesuai dengan bangun ruang dari objek budaya."
    },
    {
      id: "ciri",
      title: "Game 2: Tebak Bangun dari Ciri-Ciri",
      shortTitle: "Ciri Bangun",
      badge: "Badge Ciri",
      caveImage: "assets/caves/cave-ciri.png",
      x: 50,
      y: 61,
      description: "Baca ciri-ciri bangun ruang, lalu tebak nama bangunnya."
    },
    {
      id: "hitung",
      title: "Game 3: Hitung Volume dan Luas",
      shortTitle: "Hitung",
      badge: "Badge Hitung",
      caveImage: "assets/caves/cave-hitung.png",
      x: 76,
      y: 69,
      description: "Hitung volume atau luas permukaan dari objek geometri."
    }
  ],
  questions: {
    jaring: [
      {
        question: "Atap memanjang Benteng Fort Willem I dimodelkan sebagai prisma segitiga. Pilih jaring-jaring yang paling sesuai.",
        image: "assets/objects/obj-prisma-fort.svg",
        options: [
          { text: "Prisma: 2 segitiga + 3 persegi panjang", image: "assets/nets/net-prisma.svg" },
          { text: "Limas: 1 persegi + 4 segitiga", image: "assets/nets/net-limas.svg" },
          { text: "Kerucut: 1 lingkaran + 1 juring", image: "assets/nets/net-kerucut.svg" },
          { text: "Tabung: 2 lingkaran + 1 persegi panjang", image: "assets/nets/net-tabung.svg" }
        ],
        correct: 0,
        explanation: "Prisma segitiga memiliki dua bidang segitiga kongruen dan tiga sisi tegak berbentuk persegi panjang."
      },
      {
        question: "Atap bangunan kolonial berbentuk limas segiempat. Jaring-jaring yang benar adalah ...",
        image: "assets/objects/obj-limas-roof.svg",
        options: [
          { text: "2 lingkaran dan 1 persegi panjang", image: "assets/nets/net-tabung.svg" },
          { text: "1 persegi dan 4 segitiga", image: "assets/nets/net-limas.svg" },
          { text: "2 segitiga dan 3 persegi panjang", image: "assets/nets/net-prisma.svg" },
          { text: "1 bola utuh", image: "assets/nets/net-bola.svg" }
        ],
        correct: 1,
        explanation: "Limas segiempat terdiri atas satu alas segiempat dan empat sisi tegak berbentuk segitiga."
      },
      {
        question: "Tudung lampu Kota Lama berbentuk kerucut. Saat dibuka, jaring-jaringnya terdiri dari ...",
        image: "assets/objects/obj-kerucut-lamp.svg",
        options: [
          { text: "1 juring lingkaran dan 1 lingkaran", image: "assets/nets/net-kerucut.svg" },
          { text: "1 persegi dan 4 segitiga", image: "assets/nets/net-limas.svg" },
          { text: "2 lingkaran dan 1 persegi panjang", image: "assets/nets/net-tabung.svg" },
          { text: "6 persegi panjang", image: "assets/nets/net-balok.svg" }
        ],
        correct: 0,
        explanation: "Kerucut memiliki alas lingkaran dan selimut yang jika dibuka berbentuk juring lingkaran."
      },
      {
        question: "Tangki air peninggalan benteng berbentuk tabung. Pilih jaring-jaring tabung.",
        image: "assets/objects/obj-tabung-tank.svg",
        options: [
          { text: "2 lingkaran dan 1 persegi panjang", image: "assets/nets/net-tabung.svg" },
          { text: "1 lingkaran dan 1 juring", image: "assets/nets/net-kerucut.svg" },
          { text: "1 persegi dan 4 segitiga", image: "assets/nets/net-limas.svg" },
          { text: "2 segitiga dan 3 persegi panjang", image: "assets/nets/net-prisma.svg" }
        ],
        correct: 0,
        explanation: "Tabung memiliki dua lingkaran sejajar sebagai alas dan tutup, serta satu persegi panjang sebagai selimut."
      },
      {
        question: "Bollard Kota Lama berbentuk bola. Pernyataan tentang jaring-jaring bola yang paling tepat adalah ...",
        image: "assets/objects/obj-bola-bollard.svg",
        options: [
          { text: "Bola punya jaring-jaring datar sederhana seperti tabung", image: "assets/nets/net-tabung.svg" },
          { text: "Bola tidak memiliki jaring-jaring datar sederhana seperti prisma atau tabung", image: "assets/nets/net-bola.svg" },
          { text: "Bola tersusun dari 1 persegi dan 4 segitiga", image: "assets/nets/net-limas.svg" },
          { text: "Bola tersusun dari 2 segitiga dan 3 persegi panjang", image: "assets/nets/net-prisma.svg" }
        ],
        correct: 1,
        explanation: "Permukaan bola melengkung sempurna sehingga tidak memiliki jaring-jaring datar sederhana seperti bangun ruang sisi datar."
      }
    ],
    ciri: [
      {
        question: "Aku memiliki dua sisi sejajar dan kongruen sebagai alas dan atap. Sisi tegakku berbentuk persegi panjang atau jajargenjang. Aku adalah ...",
        image: "assets/objects/obj-prisma-fort.svg",
        options: ["Prisma", "Bola", "Kerucut", "Limas"],
        correct: 0,
        explanation: "Ciri tersebut adalah ciri prisma."
      },
      {
        question: "Aku memiliki satu alas berbentuk segi banyak dan sisi tegak berbentuk segitiga yang bertemu pada satu titik puncak. Aku adalah ...",
        image: "assets/objects/obj-limas-roof.svg",
        options: ["Tabung", "Limas", "Prisma", "Bola"],
        correct: 1,
        explanation: "Limas memiliki titik puncak dan sisi tegak berbentuk segitiga."
      },
      {
        question: "Aku memiliki alas berbentuk lingkaran, satu titik puncak, dan satu sisi lengkung. Aku adalah ...",
        image: "assets/objects/obj-kerucut-lamp.svg",
        options: ["Kerucut", "Tabung", "Prisma", "Balok"],
        correct: 0,
        explanation: "Kerucut memiliki alas lingkaran dan satu titik puncak."
      },
      {
        question: "Aku memiliki dua lingkaran sejajar yang kongruen dan satu selimut lengkung. Aku tidak memiliki titik sudut. Aku adalah ...",
        image: "assets/objects/obj-tabung-tank.svg",
        options: ["Limas", "Kerucut", "Tabung", "Prisma"],
        correct: 2,
        explanation: "Tabung memiliki alas dan tutup berbentuk lingkaran serta selimut lengkung."
      },
      {
        question: "Aku hanya memiliki satu sisi lengkung, tidak memiliki rusuk, dan tidak memiliki titik sudut. Aku adalah ...",
        image: "assets/objects/obj-bola-bollard.svg",
        options: ["Bola", "Tabung", "Kerucut", "Limas"],
        correct: 0,
        explanation: "Bola adalah bangun ruang sisi lengkung tanpa rusuk dan titik sudut."
      }
    ],
    hitung: [
      {
        question: "Atap Benteng Fort Willem I berbentuk prisma segitiga. Alas segitiga 8 m, tinggi segitiga 3 m, dan panjang bangunan 20 m. Volume atap adalah ...",
        image: "assets/objects/obj-prisma-fort.svg",
        options: ["120 m³", "180 m³", "240 m³", "480 m³"],
        correct: 2,
        explanation: "V = luas alas × panjang = (1/2 × 8 × 3) × 20 = 12 × 20 = 240 m³."
      },
      {
        question: "Atap rumah pompa berbentuk limas segiempat. Panjang sisi alas 6 m dan tinggi limas 4 m. Volume ruang atap adalah ...",
        image: "assets/objects/obj-limas-roof.svg",
        options: ["36 m³", "48 m³", "72 m³", "96 m³"],
        correct: 1,
        explanation: "V = 1/3 × luas alas × tinggi = 1/3 × (6 × 6) × 4 = 48 m³."
      },
      {
        question: "Penutup lampu berbentuk kerucut. Jari-jari 14 cm, tinggi 48 cm, dan garis pelukis 50 cm. Luas permukaannya adalah ...",
        image: "assets/objects/obj-kerucut-lamp.svg",
        options: ["2.816 cm²", "1.856 cm²", "9.856 cm²", "3.080 cm²"],
        correct: 0,
        explanation: "LP = πr(r+s) = 22/7 × 14 × (14+50) = 44 × 64 = 2.816 cm²."
      },
      {
        question: "Tangki air berbentuk tabung memiliki jari-jari 2 m dan tinggi 5 m. Jika π = 3,14, volume tabung adalah ...",
        image: "assets/objects/obj-tabung-tank.svg",
        options: ["31,4 m³", "62,8 m³", "87,92 m³", "125,6 m³"],
        correct: 1,
        explanation: "V = πr²t = 3,14 × 2² × 5 = 62,8 m³."
      },
      {
        question: "Bollard berbentuk bola memiliki diameter 42 cm. Dengan π = 22/7, luas permukaan bola adalah ...",
        image: "assets/objects/obj-bola-bollard.svg",
        options: ["2.772 cm²", "3.808 cm²", "5.544 cm²", "38.808 cm³"],
        correct: 2,
        explanation: "r = 21 cm. LP = 4πr² = 4 × 22/7 × 21² = 5.544 cm²."
      }
    ]
  }
};
