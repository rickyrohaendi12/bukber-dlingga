import { TableItem, MenuItem, AddonItem, ReservationData } from '../types/reservation';

export const INITIAL_TABLES: TableItem[] = [
  // Zona Semi-Outdoor Garden
  {
    id: 'G-01',
    name: 'Meja G-01',
    zone: 'semi-outdoor',
    zoneName: 'Zona Semi-Outdoor Garden',
    seats: 4,
    status: 'available',
    minPax: 2,
    maxPax: 4,
    description: 'Dekat air mancur taman, sejuk berangin alami.'
  },
  {
    id: 'G-02',
    name: 'Meja G-02',
    zone: 'semi-outdoor',
    zoneName: 'Zona Semi-Outdoor Garden',
    seats: 4,
    status: 'available',
    minPax: 2,
    maxPax: 4,
    description: 'Area kanopi hijau, nyaman untuk keluarga kecil.'
  },
  {
    id: 'G-03',
    name: 'Meja G-03',
    zone: 'semi-outdoor',
    zoneName: 'Zona Semi-Outdoor Garden',
    seats: 6,
    status: 'available',
    minPax: 4,
    maxPax: 6,
    description: 'Meja panjang kayu jati di sudut taman.'
  },
  {
    id: 'G-04',
    name: 'Meja G-04',
    zone: 'semi-outdoor',
    zoneName: 'Zona Semi-Outdoor Garden',
    seats: 6,
    status: 'available',
    minPax: 4,
    maxPax: 6,
    description: 'Area tengah garden, suasana asri.'
  },
  {
    id: 'G-05',
    name: 'Meja G-05',
    zone: 'semi-outdoor',
    zoneName: 'Zona Semi-Outdoor Garden',
    seats: 8,
    status: 'available',
    minPax: 6,
    maxPax: 8,
    description: 'Kapasitas besar cocok untuk kumpul tim atau reuni.'
  },
  {
    id: 'G-06',
    name: 'Meja G-06',
    zone: 'semi-outdoor',
    zoneName: 'Zona Semi-Outdoor Garden',
    seats: 8,
    status: 'available',
    minPax: 6,
    maxPax: 8,
    description: 'Area semi outdoor tepi tanaman tropis.'
  },
  {
    id: 'T-07',
    name: 'Meja T-07',
    zone: 'semi-outdoor',
    zoneName: 'Area Semi-Outdoor Garden',
    seats: 6,
    status: 'available',
    minPax: 4,
    maxPax: 6,
    description: 'Meja favorit garden dengan akses mudah ke musholla.'
  },

  // Zona Indoor Main Lounge
  {
    id: 'M-01',
    name: 'Meja M-01',
    zone: 'indoor-lounge',
    zoneName: 'Zona Indoor Main Lounge',
    seats: 4,
    status: 'available',
    isFavorite: true,
    minPax: 2,
    maxPax: 4,
    description: 'Area utama tepat di seberang Takjil Buffet Bar, ber-AC dingin.'
  },
  {
    id: 'M-02',
    name: 'Meja M-02',
    zone: 'indoor-lounge',
    zoneName: 'Zona Indoor Main Lounge',
    seats: 4,
    status: 'available',
    minPax: 2,
    maxPax: 4,
    description: 'Booth sofa empuk interior Skandinavia hangat.'
  },
  {
    id: 'M-03',
    name: 'Meja M-03',
    zone: 'indoor-lounge',
    zoneName: 'Zona Indoor Main Lounge',
    seats: 6,
    status: 'available',
    minPax: 4,
    maxPax: 6,
    description: 'Dekat jendela estetik, pencahayaan warm ambience.'
  },
  {
    id: 'M-04',
    name: 'Meja M-04',
    zone: 'indoor-lounge',
    zoneName: 'Zona Indoor Main Lounge',
    seats: 10,
    status: 'available',
    minPax: 8,
    maxPax: 10,
    description: 'Communal table besar untuk rombongan kantor.'
  },
  {
    id: 'M-05',
    name: 'Meja M-05',
    zone: 'indoor-lounge',
    zoneName: 'Zona Indoor Main Lounge',
    seats: 12,
    status: 'available',
    minPax: 8,
    maxPax: 12,
    description: 'Meja VIP panjang untuk keluarga besar dan reuni.'
  },
  {
    id: 'M-06',
    name: 'Meja M-06',
    zone: 'indoor-lounge',
    zoneName: 'Zona Indoor Main Lounge',
    seats: 4,
    status: 'available',
    minPax: 2,
    maxPax: 4,
    description: 'Dekat akses kasir dan musholla lantai 2.'
  }
];

export const MENU_PACKAGES: MenuItem[] = [
  {
    id: 'paket-hemat',
    name: 'Paket Hemat',
    category: 'package',
    price: 65000,
    minPax: 2,
    description: 'Solusi nikmat dan bersahabat untuk reuni kecil atau berdua.',
    features: [
      'Nasi Liwet Gurih Rempah Wangi',
      'Ayam Bakar Madu Spesial Kafe',
      'Kurma Medjool & Kolak Pisang Manis',
      'Es Teh Manis Melati Segar'
    ]
  },
  {
    id: 'paket-rame-rame',
    name: 'Paket Rame-Rame',
    category: 'package',
    price: 115000,
    minPax: 4,
    isPopular: true,
    description: 'Pilihan seimbang untuk tim kantor, reuni alumni, dan keluarga besar.',
    features: [
      'Bebek Crispy Sambal Korek / Beef Teriyaki',
      'Aneka Bakwan Jagung & Tempe Mendoan Hangat',
      'Es Blewah Selasih Sirup Cocopandan',
      'Akses Buffet Takjil Bar Komplit Bebas Ambil'
    ]
  },
  {
    id: 'paket-premium-sultan',
    name: 'Paket Premium Sultan',
    category: 'package',
    price: 185000,
    minPax: 4,
    isVip: true,
    description: 'Hidangan eksklusif bintang lima dengan pelayanan prioritas tanpa antre.',
    features: [
      'Iga Bakar Madu Karamel / Salmon Saus Kurma',
      'Signature Mocktail Ramadan & Infused Mint',
      'Artisan Dessert Platter & Umm Ali Hangat',
      'Free Flow Premium Takjil Bar & Artisanal Tea'
    ]
  }
];

export const ADDON_ITEMS: AddonItem[] = [
  {
    id: 'kopi-aren',
    name: 'Es Kopi Aren Spesial',
    category: 'Minuman Segar',
    price: 22000,
    description: 'Kopi susu gula aren aren organik dengan foam susu lembut.',
    unit: 'gelas'
  },
  {
    id: 'bakwan-platter',
    name: 'Bakwan Jagung Platter (Isi 5)',
    category: 'Camilan Gurih',
    price: 28000,
    description: 'Bakwan jagung manis renyah disajikan dengan sambal roa & cabai rawit.',
    unit: 'porsi'
  },
  {
    id: 'tempe-mendoan',
    name: 'Tempe Mendoan Hangat (Isi 4)',
    category: 'Camilan Gurih',
    price: 24000,
    description: 'Mendoan lembut daun bawang dengan cocolan sambal kecap pedas manis.',
    unit: 'porsi'
  },
  {
    id: 'es-blewah',
    name: 'Es Blewah Selasih Cocopandan',
    category: 'Minuman Segar',
    price: 18000,
    description: 'Serutan buah blewah segar dengan biji selasih dan es serut manis.',
    unit: 'gelas'
  },
  {
    id: 'tahu-bakso',
    name: 'Tahu Bakso Goreng Krispi (Isi 4)',
    category: 'Camilan Gurih',
    price: 26000,
    description: 'Tahu pong isi olahan daging sapi gurih berpadu saus manis asam.',
    unit: 'porsi'
  }
];

export const INITIAL_TICKETS: ReservationData[] = [];

export const FAQS = [
  {
    id: 'q1',
    icon: 'group_add',
    question: 'Bagaimana jika ingin menambah jumlah orang / kursi?',
    answer: 'Penambahan pax dapat dilakukan maksimal 6 jam sebelum waktu reservasi dengan menghubungi Customer Service WhatsApp kami. Penambahan kursi tambahan (extra chair) pada meja maksimal 2 kursi dengan biaya paket tambahan.'
  },
  {
    id: 'q2',
    icon: 'cancel',
    question: 'Apa kebijakan pembatalan & pengembalian dana?',
    answer: 'Pembatalan tanpa biaya (refund DP 100%) dapat diajukan H-1 sebelum tanggal buka puasa. Pembatalan pada hari-H (kurang dari 12 jam) dikenakan biaya operasional bahan dapur sebesar 50% dari total DP yang telah disetorkan.'
  },
  {
    id: 'q3',
    icon: 'mosque',
    question: 'Apakah tersedia musholla dan tempat wudhu yang memadai?',
    answer: 'Ya! Bukber Lounge menyediakan Musholla ber-AC di Lantai 2 dengan kapasitas hingga 35-40 jamaah, dilengkapi tempat wudhu terpisah ikhwan & akhwat, mukena bersih, sarung, serta sajadah. Sholat Maghrib dan Isya berjamaah diadakan tepat waktu.'
  }
];
