// functions/index.js — Aero Cart Backend
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── Haversine Distance (km) ──────────────────────────────────────────────────
function haversine([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestRider(vendorCoords) {
  const idle = db.riders.filter(r => r.status === "Idle");
  if (!idle.length) return null;
  return idle.reduce((nearest, rider) => {
    return haversine(vendorCoords, rider.coords) < haversine(vendorCoords, nearest.coords)
      ? rider : nearest;
  });
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const db = {
  vendors: [
    { id: 1, name: "Kundrathur Fresh Mart", address: "Node #8A, Kundrathur High Road, Chennai", coords: [12.9750, 80.1080] },
    { id: 2, name: "Tambaram Central Hub",  address: "Node #4B, Shanmugam Road, West Tambaram, Chennai", coords: [12.9260, 80.1220] },
  ],

  products: [
    { id: 1,  name: "Amul Fresh Toned Milk",      weight: "1 Litre / 500 ml", price: 66,  stock: { 1: 6,  2: 28 }, variants: [{ name: "1 Litre Pack", stock: { 1: 2, 2: 18 } }, { name: "500 ml Pack", stock: { 1: 4, 2: 10 } }], category: "Dairy",    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80" },
    { id: 2,  name: "Aavin Green Magic Milk",      weight: "500 ml",           price: 24,  stock: { 1: 15, 2: 25 }, category: "Dairy",    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80" },
    { id: 3,  name: "Farm Fresh Country Eggs",     weight: "6 / 12 Units",     price: 54,  stock: { 1: 4,  2: 0  }, variants: [{ name: "6 Pack Cardboard", stock: { 1: 3, 2: 0 } }, { name: "12 Pack Premium", stock: { 1: 1, 2: 0 } }], category: "Dairy",    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&auto=format&fit=crop&q=80" },
    { id: 4,  name: "Ooty Carrots Organic",        weight: "500 g",            price: 45,  stock: { 1: 22, 2: 12 }, category: "Groceries", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80" },
    { id: 5,  name: "Premium Basmati Rice",        weight: "1 kg",             price: 110, stock: { 1: 1,  2: 10 }, category: "Groceries", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80" },
    { id: 6,  name: "Britannia Bourbon Biscuits",  weight: "150 g",            price: 20,  stock: { 1: 40, 2: 30 }, category: "Snacks",   image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=80" },
    { id: 7,  name: "Lay's Magic Masala Chips",    weight: "50 g",             price: 20,  stock: { 1: 8,  2: 14 }, category: "Snacks",   image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80" },
    { id: 8,  name: "Kanan Devan Tea Powder",      weight: "250 g",            price: 95,  stock: { 1: 12, 2: 6  }, category: "Groceries", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80" },
    { id: 9,  name: "Heritage Fresh Paneer Pack",  weight: "200 g",            price: 85,  stock: { 1: 3,  2: 8  }, category: "Dairy",    image: "https://images.unsplash.com/photo-1634482326227-ec17f7f28689?w=400&auto=format&fit=crop&q=80" },
    { id: 10, name: "Fresh Gala Apples",           weight: "4 Units",          price: 180, stock: { 1: 15, 2: 10 }, category: "Groceries", image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format&fit=crop&q=80" },
  ],

  riders: [
    { id: "RIDER-1", name: "Vignesh S.",  vehicle: "Scooter (Vibrant Coral)", coords: [12.9550, 80.1150], status: "Idle",      earnings: 350, deliveriesCount: 7  },
    { id: "RIDER-2", name: "Rahul M.",    vehicle: "Electric Scooter",        coords: [12.9420, 80.1110], status: "Idle",      earnings: 890, deliveriesCount: 18 },
    { id: "RIDER-3", name: "Aswin K.",    vehicle: "Motorcycle",              coords: [12.9690, 80.0990], status: "Idle",      earnings: 150, deliveriesCount: 3  },
  ],

  orders: [],
  feedback: [],
};

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── Vendors ──────────────────────────────────────────────────────────────────
app.get("/api/vendors", (_, res) => res.json(db.vendors));

app.post("/api/vendors", (req, res) => {
  const vendor = { id: db.vendors.length + 1, ...req.body };
  db.vendors.push(vendor);
  // Give new vendor stock for all products
  db.products.forEach(p => {
    p.stock[vendor.id] = Math.floor(10 + Math.random() * 20);
  });
  res.json(vendor);
});

// ─── Products ─────────────────────────────────────────────────────────────────
app.get("/api/products", (_, res) => res.json(db.products));

app.patch("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  db.products[idx] = { ...db.products[idx], ...req.body };
  res.json(db.products[idx]);
});

// ─── Riders ───────────────────────────────────────────────────────────────────
app.get("/api/riders", (_, res) => res.json(db.riders));

app.post("/api/riders", (req, res) => {
  const rider = { id: `RIDER-${db.riders.length + 1}`, ...req.body };
  db.riders.push(rider);
  res.json(rider);
});

app.patch("/api/riders/:id", (req, res) => {
  const idx = db.riders.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  db.riders[idx] = { ...db.riders[idx], ...req.body };
  res.json(db.riders[idx]);
});

// ─── Orders ───────────────────────────────────────────────────────────────────
app.get("/api/orders", (_, res) => res.json(db.orders));

// POST /api/orders — Customer checkout
app.post("/api/orders", (req, res) => {
  const { vendorId, vendorName, vendorAddress, items, total, paymentMethod, deliveryArea } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: "items required" });

  const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
  const order = {
    id: orderId,
    vendorId: Number(vendorId),
    vendorName,
    vendorAddress,
    items,
    total,
    status: "Pending",
    paymentMethod,
    deliveryArea,
    assignedRider: null,
    createdAt: new Date().toISOString(),
  };
  db.orders.unshift(order);

  // Deduct stock
  items.forEach(({ product, quantity }) => {
    const p = db.products.find(x => x.id === product.id);
    if (p) {
      const cur = p.stock[vendorId] || 0;
      p.stock[vendorId] = Math.max(0, cur - quantity);
      if (p.variants) {
        p.variants[0].stock[vendorId] = Math.max(0, (p.variants[0].stock[vendorId] || 0) - quantity);
      }
    }
  });

  res.json(order);
});

// PATCH /api/orders/:id — Vendor accepts → backend auto-assigns nearest rider
app.patch("/api/orders/:id", (req, res) => {
  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });

  const updates = req.body;
  db.orders[idx] = { ...db.orders[idx], ...updates };

  // When vendor accepts: auto-assign nearest idle rider after 3 seconds
  if (updates.status === "Accepted") {
    const orderId = db.orders[idx].id;
    const vendorId = db.orders[idx].vendorId;
    const vendor = db.vendors.find(v => v.id === vendorId);

    setTimeout(() => {
      const oIdx = db.orders.findIndex(o => o.id === orderId);
      if (oIdx === -1 || db.orders[oIdx].status !== "Accepted") return;

      const rider = findNearestRider(vendor ? vendor.coords : [12.95, 80.11]);
      if (!rider) {
        console.log(`⚠️  No idle riders for order ${orderId}`);
        return;
      }

      // Mark rider as delivering
      const rIdx = db.riders.findIndex(r => r.id === rider.id);
      if (rIdx !== -1) db.riders[rIdx].status = "Delivering";

      // Dispatch order
      db.orders[oIdx].status = "Dispatched";
      db.orders[oIdx].assignedRider = db.riders[rIdx];
      console.log(`🛵  Rider ${rider.name} dispatched for order ${orderId} (nearest to vendor)`);
    }, 3000);
  }

  res.json(db.orders[idx]);
});

// ─── Feedback ─────────────────────────────────────────────────────────────────
app.get("/api/feedback", (_, res) => res.json(db.feedback));

app.post("/api/feedback", (req, res) => {
  const fb = { id: `FB-${Math.floor(1000 + Math.random() * 9000)}`, ...req.body, createdAt: new Date().toISOString() };
  db.feedback.unshift(fb);
  res.json(fb);
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Aero Cart backend on port ${PORT}`));
