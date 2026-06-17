import { MenuItem, Review, BusinessInfo } from './types';

export const BUSINESS_DETAILS: BusinessInfo = {
  name: "Shahi Khana Nashta Point & Milk Shop",
  type: "Authentic Punjabi Restaurant, Morning Breakfast & Pure Dairy",
  address: "Shop#6 m-block, Wapda Town Phase 2 Multan, 60000, Pakistan",
  phone: "+92 322 3399774",
  phoneRaw: "+923223399774",
  coordinates: {
    lat: 30.2392098,
    lng: 71.5248989,
    text: "Multan, Punjab, Pakistan"
  },
  mapsUrl: "https://www.google.com/maps/place/Shahi+Khana+Nashta+Point+%26+Milk+Shop/@30.2391719,71.5244101,17.82z/data=!4m6!3m5!1s0x393b3500751ec5c9:0x82c705bac2b3381f!8m2!3d30.2392098!4d71.5248989!16s%2Fg%2F11y8_jq1k5?entry=ttu&g_ep=EgoyMDI2MDYwMS4wIKXMDSoASAFQAw%3D%3D",
  hours: "Breakfast: 06:00 AM – 01:30 PM (Daily)",
  rating: 4.8,
  reviewCount: 248
};

export const MENU_ITEMS: MenuItem[] = [
  // Breakfast Curry / Platters / Gravies
  {
    id: "mi-1",
    name: "Lahori Channay (with Khoya)",
    nameUrdu: "لاہوری چنے (کھوئے والے)",
    description: "Traditional slow-cooked chickpeas enhanced with rich khoya, black pepper, and authentic local spices.",
    priceHalf: 50,
    priceFull: 100,
    hasHalfOption: true,
    category: "breakfast",
    isSpecialty: true,
    rating: 4.9,
    reviewCount: 120
  },
  {
    id: "mi-2",
    name: "Special Halwa Pori (1 KG / Platter)",
    nameUrdu: "اسپیشل حلوہ پوری (1 کلو)",
    description: "Finest crispy layered hot puffed puris served with aromatic sweet suji halwa, sour pickle & channay gravy.",
    priceHalf: 300,
    priceFull: 550,
    hasHalfOption: true,
    category: "breakfast",
    isSpecialty: true,
    rating: 4.9,
    reviewCount: 185
  },
  {
    id: "mi-3",
    name: "Special Mutton Paye",
    nameUrdu: "اسپیشل مٹن پائے",
    description: "Premium goat trotters simmered overnight in aromatic spices and rich natural stew gravy.",
    priceFull: 380,
    hasHalfOption: false,
    category: "breakfast",
    isSpecialty: true,
    rating: 4.8,
    reviewCount: 74
  },
  {
    id: "mi-4",
    name: "Special Beef Nihari",
    nameUrdu: "اسپیشل بیف نہاری",
    description: "Delectable slow-simmered beef shank cooked to tender perfection under precise spiced flour infusion.",
    priceHalf: 200,
    priceFull: 380,
    hasHalfOption: true,
    category: "breakfast",
    isSpecialty: true,
    rating: 4.9,
    reviewCount: 93
  },
  {
    id: "mi-5",
    name: "Chicken Kofta (1 Pcs)",
    nameUrdu: "چکن کوفتہ (1 پیس)",
    description: "Juicy, perfectly spiced minced chicken meatball simmered in mouthwatering masala gravy.",
    priceFull: 60,
    hasHalfOption: false,
    category: "breakfast",
    rating: 4.7,
    reviewCount: 42
  },
  {
    id: "mi-6",
    name: "Chicken Drum / Tahi (1 Pcs)",
    nameUrdu: "چکن ڈرم / تھانی (1 پیس)",
    description: "Succulent, flavor-packed chicken drumstick or thigh pan-seared and seasoned to local standard.",
    priceFull: 60,
    hasHalfOption: false,
    category: "breakfast",
    rating: 4.6,
    reviewCount: 28
  },
  {
    id: "mi-7",
    name: "Omelette",
    nameUrdu: "آملٹ",
    description: "Fluffy pan-scrambled eggs loaded with fresh chopped onions, green chilies, herbs, and warm spices.",
    priceFull: 60,
    hasHalfOption: false,
    category: "breakfast",
    rating: 4.8,
    reviewCount: 56
  },
  {
    id: "mi-8",
    name: "Egg Half Fry",
    nameUrdu: "انڈہ (ہاف فرائی)",
    description: "Perfect sunny-side-up egg prepared on hot flat tawa with soft yolk and light seasoning.",
    priceFull: 50,
    hasHalfOption: false,
    category: "breakfast",
    rating: 4.7,
    reviewCount: 31
  },
  // Flatbreads / Breads (Naan & Paratha)
  {
    id: "mi-9",
    name: "Special Roghni Naan",
    nameUrdu: "اسپیشل روغنی نان",
    description: "Soft, leavened royal bread baked in a hot clay oven, styled with sesame seeds, and glazed with pure ghee.",
    priceFull: 50,
    hasHalfOption: false,
    category: "bread",
    rating: 4.9,
    reviewCount: 114
  },
  {
    id: "mi-10",
    name: "Kalonji Naan",
    nameUrdu: "کلونجی نان",
    description: "Freshly-baked tandoor bread topped with aromatic kalonji (nigella seeds) for exceptional earthy flavor.",
    priceFull: 60,
    hasHalfOption: false,
    category: "bread",
    rating: 4.8,
    reviewCount: 52
  },
  {
    id: "mi-11",
    name: "Garlic Naan",
    nameUrdu: "گارلک نان",
    description: "Fragrant tandoor bread infused with freshly minced fresh garlic cloves and butter glaze.",
    priceFull: 60,
    hasHalfOption: false,
    category: "bread",
    rating: 4.8,
    reviewCount: 67
  },
  {
    id: "mi-12",
    name: "Tandoori Paratha",
    nameUrdu: "تندوری پراٹھا",
    description: "Crispy tandoor-baked laminated wheat bread with layers of richness and golden-baked crust.",
    priceFull: 50,
    hasHalfOption: false,
    category: "bread",
    rating: 4.8,
    reviewCount: 88
  },
  {
    id: "mi-13",
    name: "Tawa Paratha",
    nameUrdu: "توا پراٹھا",
    description: "Traditional crispy, multi-layered flatbread shallow-fried on flat tawa with pure premium fat.",
    priceFull: 50,
    hasHalfOption: false,
    category: "bread",
    rating: 4.9,
    reviewCount: 102
  },
  {
    id: "mi-14",
    name: "Aalo Paratha",
    nameUrdu: "آلو پراٹھا",
    description: "Hearty flatbread stuffed with mashed seasoned potatoes, fresh green coriander, and crushed spices.",
    priceFull: 90,
    hasHalfOption: false,
    category: "bread",
    rating: 4.8,
    reviewCount: 76
  },
  {
    id: "mi-15",
    name: "Egg Paratha",
    nameUrdu: "انڈہ پراٹھا",
    description: "Creative layered paratha loaded with eggs pan-fried together for the ultimate high-protein crisp bite.",
    priceFull: 90,
    hasHalfOption: false,
    category: "bread",
    rating: 4.7,
    reviewCount: 48
  },
  // Dairy House (Malai / Dahi / Lassi)
  {
    id: "mi-16",
    name: "Dahi (Bowl)",
    nameUrdu: "دہی (باؤل)",
    description: "Naturally naturally-fermented fresh thick yogurt with active rich cultures and traditional deep taste.",
    priceFull: 70,
    hasHalfOption: false,
    category: "dairy",
    rating: 4.9,
    reviewCount: 95
  },
  {
    id: "mi-17",
    name: "Special Lassi",
    nameUrdu: "اسپیشل لسی",
    description: "Churned sweet yogurt beverage, served ice cold with a generous floating layer of fresh thick milk cream (Malai).",
    priceHalf: 120,
    priceFull: 160,
    hasHalfOption: true,
    category: "dairy",
    isSpecialty: true,
    rating: 4.9,
    reviewCount: 156
  },
  // Beverages
  {
    id: "mi-18",
    name: "Special Tea (Dodh Patti)",
    nameUrdu: "اسپیشل چائے (دودھ پتی)",
    description: "Premium robust black tea leaves slowly boiled entirely in thick pasture-fresh buffalo milk. No water added.",
    priceFull: 80,
    hasHalfOption: false,
    category: "beverages",
    isSpecialty: true,
    rating: 4.9,
    reviewCount: 172
  }
];

export const BUSINESS_REVIEWS: Review[] = [
  {
    id: "rv-1",
    author: "Muhammad Ali",
    rating: 5,
    comment: "The best breakfast point in Wapda Town Multan. Highly recommended Khoya Channay and Roghni Naan. The taste is authentic Lahori style and the preparation is very clean.",
    date: "Jun 02, 2026"
  },
  {
    id: "rv-2",
    author: "Sidra Batool",
    rating: 5,
    comment: "Their Special Dodh Patti tea and Sweet Lassi with thick malai are hands down the best in the city. Outstanding service and real fresh buffalo milk quality.",
    date: "May 28, 2026"
  },
  {
    id: "rv-3",
    author: "Dr. Asif Jamil",
    rating: 5,
    comment: "Tried their Halwa Puri platter today. Pure desi ghee flavor and very light puffed puris. No heavy oil smell. Highly recommended for family Sunday breakfast!",
    date: "May 24, 2026"
  },
  {
    id: "rv-4",
    author: "Muhammad Umair",
    rating: 5,
    comment: "A genuine Lahore-style nashta in Multan. The mutton paye are rich, gelatinous, and spiced perfectly. Highly recommended for Sunday family breakfast!",
    date: "May 19, 2026"
  },
  {
    id: "rv-5",
    author: "Kashif Munir",
    rating: 5,
    comment: "Unmatched dairy standard. Traditional sweet yogurt (dahi) and lassi are thick and sweet. Clean environment and exceptionally warm Multani hospitality.",
    date: "May 15, 2026"
  },
  {
    id: "rv-6",
    author: "Aisha Malik",
    rating: 4,
    comment: "Super busy on Sunday mornings, but the wait is totally worth it. The Roghni Naan was hot and fluffy and paired excellently with their slow-cooked khoya channay. Active WhatsApp replies for takeaway orders too.",
    date: "May 10, 2026"
  },
  {
    id: "rv-7",
    author: "Zia Ur Rehman",
    rating: 5,
    comment: "Truly royal standard. The Aalo Paratha is stuffed generously and cooked with premium ghee. Excellent cardamom aroma in their special tea.",
    date: "May 05, 2026"
  },
  {
    id: "rv-8",
    author: "Farhan Qureshi",
    rating: 5,
    comment: "Excellent taste and very reasonable prices. Shahi Khana is our absolute go-to place in Wapda Town for breakfast catering and daily pure milk supplies.",
    date: "May 01, 2026"
  }
];
