/**
 * DukkanQR - Shared Data Store
 * Veriler localStorage'da saklanır, olmadığında örnek veriler kullanılır.
 */

const DEFAULT_DATA = {
  shopName: "Dükkanım",
  shopLogo: null,
  aboutUs: {
    description: "Merhaba! Lezzetli yemekler ve kaliteli hizmetle buradayorüz. En taze malzemeleri kullanarak hazırladığımız ürünlerimizi denemenizi bekliyoruz.",
    address: "İstanbul, Türkiye",
    phone: "",
    website: "",
    mapEmbed: ""
  },
  emailjsConfig: {
    publicKey: "",
    serviceId: "",
    templateId: "",
    adminEmail: ""
  },
  categories: [
    { id: 1, name: "Burgerler", icon: "🍔" },
    { id: 2, name: "Pizzalar", icon: "🍕" },
    { id: 3, name: "İçecekler", icon: "🥤" },
    { id: 4, name: "Tatlılar", icon: "🍰" }
  ],
  products: [
    {
      id: 1, categoryId: 1,
      name: "Klasik Burger",
      description: "Dana eti, marul, domates, özel sos",
      price: "85.00",
      image: null,
      available: true
    },
    {
      id: 2, categoryId: 1,
      name: "Cheeseburger",
      description: "Dana eti, cheddar, turşu, ketçap",
      price: "95.00",
      image: null,
      available: true
    },
    {
      id: 3, categoryId: 2,
      name: "Margarita Pizza",
      description: "Domates sos, mozzarella, fesleğen",
      price: "120.00",
      image: null,
      available: true
    },
    {
      id: 4, categoryId: 2,
      name: "Sucuklu Pizza",
      description: "Sucuk, mozzarella, soğan, biber",
      price: "135.00",
      image: null,
      available: true
    },
    {
      id: 5, categoryId: 3,
      name: "Ayran",
      description: "Ev yapımı taze ayran",
      price: "25.00",
      image: null,
      available: true
    },
    {
      id: 6, categoryId: 3,
      name: "Limonata",
      description: "Taze sıkılmış limon",
      price: "35.00",
      image: null,
      available: true
    },
    {
      id: 7, categoryId: 4,
      name: "Sütlaç",
      description: "Fırın sütlaç, tarçın",
      price: "45.00",
      image: null,
      available: true
    },
    {
      id: 8, categoryId: 4,
      name: "Brownie",
      description: "Çikolatalı brownie, dondurma ile",
      price: "60.00",
      image: null,
      available: true
    }
  ],
  visitorCount: 0
};

const STORAGE_KEY = "dukkanqr_data";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Ensure visitorCount exists for backward compatibility
      if (data.visitorCount === undefined) data.visitorCount = 0;
      return data;
    }
  } catch (e) { }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
}

// Global store
let store = loadData();
