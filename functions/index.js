// functions/index.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ─── In-memory data store ────────────────────────────────────────────────────

let vendors = [
  { id: 1, name: "Kundrathur Fresh Mart", address: "Node #8A, Kundrathur High Road, Chennai", coords: [12.9750, 80.1080] },
  { id: 2, name: "Tambaram Central Hub", address: "Node #4B, Shanmugam Road, West Tambaram, Chennai", coords: [12.9260, 80.1220] },
];

let products = [
  { id: 1, name: "Amul Fresh Toned Milk", weight: "1 Litre / 500 ml", price: 66, stock: { 1: 6, 2: 28 }, category: "Dairy", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80" },
  { id: 2, name: "Aavin Green Magic Milk", weight: "500 ml", price: 24, stock: { 1: 15, 2: 25 }, category: "Dairy", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80" },
  { id: 3, name: "Farm Fresh Country Eggs", weight: "6 / 12 Units", price: 54, stock: { 1: 4, 2: 0 }, category: "Dairy", image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&auto=format&fit=crop&q=80" },
  { id: 4, name: "Ooty Carrots Organic", weight: "500 g", price: 45, stock: { 1: 22, 2: 12 }, category: "Groceries", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80" },
  { id: 5, name: "Premium Basmati Rice", weight: "1 kg", price: 110, stock: { 1: 1, 2: 10 }, category: "Groceries", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80" },
  { id: 6, name: "Britannia Bourbon Biscuits", weight: "150 g", price: 20, stock: { 1: 40, 2: 30 }, category: "Snacks", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=80" },
  { id: 7, name: "Lay's Magic Masala Chips", weight: "50 g", price: 20, stock: { 1: 8, 2: 14 }, category: "Snacks", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80" },
  { id: 8, name: "Kanan Devan Tea Powder", weight: "250 g", price: 95, stock: { 1: 12, 2: 6 }, category: "Groceries", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80" },
  { id: 9, name: "Heritage Fresh Paneer Pack", weight: "200 g", price: 85, stock: { 1: 3, 2: 8 }, category: "Dairy", image: "https://images.unsplash.com/photo-1634482326227-ec17f7f28689?w=400&auto=format&fit=crop&q=80" },
  { id: 10, name: "Fresh Gala Apples", weight: "4 Units", price: 180, stock: { 1: 15, 2: 10 }, category: "Groceries", image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format&fit=crop&q=80" },
];

let riders = [
  { id: "RIDER-1", name: "Vignesh S.", vehicle: "Scooter (Vibrant Coral)", coords: [12.9550, 80.1150], status: "Delivering", earnings: 350, deliveriesCount: 7 },
  { id: "RIDER-2", name: "Rahul M.", vehicle: "Electric Scooter", coords: [12.9420, 80.1110], status: "Idle", earnings: 890, deliveriesCount: 18 },
  { id: "RIDER-3", name: "Aswin K.", vehicle: "Motorcycle", coords: [12.9690, 80.0990], status: "Idle", earnings: 150, deliveriesCount: 3 },
];

let orders = [
  { id: "ORD-101", vendorId: 1, vendorName: "Kundrathur Fresh Mart", vendorAddress: "Node #8A, Kundrathur High Road, Chennai", items: [{ product: products[0], quantity: 2 }, { product: products[7], quantity: 1 }], total: 252, status: "Pending", paymentMethod: "COD", deliveryArea: "Tambaram West Sector 3" },
  { id: "ORD-102", vendorId: 2, vendorName: "Tambaram Central Hub", vendorAddress: "Node #4B, Shanmugam Road, West Tambaram, Chennai", items: [{ product: products[1], quantity: 1 }, { product: products[5], quantity: 2 }], total: 89, status: "Accepted", paymentMethod: "Online", deliveryArea: "Kundrathur Sector 1" },
  { id: "ORD-103", vendorId: 1, vendorName: "Kundrathur Fresh Mart", vendorAddress: "Node #8A, Kundrathur High Road, Chennai", items: [{ product: products[8], quantity: 1 }, { product: products[3], quantity: 1 }], total: 155, status: "Dispatched", paymentMethod: "Online", deliveryArea: "Tambaram East Sector 4", assignedRider: riders[0] },
];

let feedbacks = [];

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── Vendors ──────────────────────────────────────────────────────────────────
app.get("/api/vendors", (req, res) => res.json(vendors));
app.post("/api/vendors", (req, res) => {
  const newVendor = { id: vendors.length + 1, ...req.body };
  vendors.push(newVendor);
  res.json(newVendor);
});

// ─── Products ─────────────────────────────────────────────────────────────────
app.get("/api/products", (req, res) => res.json(products));
app.patch("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  products = products.map(p => p.id === id ? { ...p, ...req.body } : p);
  res.json(products.find(p => p.id === id));
});

// ─── Riders ───────────────────────────────────────────────────────────────────
app.get("/api/riders", (req, res) => res.json(riders));
app.post("/api/riders", (req, res) => {
  const newRider = { id: `RIDER-${riders.length + 1}`, ...req.body };
  riders.push(newRider);
  res.json(newRider);
});
app.patch("/api/riders/:id", (req, res) => {
  riders = riders.map(r => r.id === req.params.id ? { ...r, ...req.body } : r);
  res.json(riders.find(r => r.id === req.params.id));
});

// ─── Orders ───────────────────────────────────────────────────────────────────
app.get("/api/orders", (req, res) => res.json(orders));
app.post("/api/orders", (req, res) => {
  const newOrder = { id: `ORD-${Math.floor(100 + Math.random() * 900)}`, ...req.body };
  orders.unshift(newOrder);
  // Deduct stock
  if (newOrder.items && newOrder.vendorId) {
    newOrder.items.forEach(item => {
      products = products.map(p => {
        if (p.id === item.product.id) {
          const cur = p.stock[newOrder.vendorId] || 0;
          return { ...p, stock: { ...p.stock, [newOrder.vendorId]: Math.max(0, cur - item.quantity) } };
        }
        return p;
      });
    });
  }
  res.json(newOrder);
});
app.patch("/api/orders/:id", (req, res) => {
  orders = orders.map(o => o.id === req.params.id ? { ...o, ...req.body } : o);
  res.json(orders.find(o => o.id === req.params.id));
});

// ─── Feedback ─────────────────────────────────────────────────────────────────
app.get("/api/feedback", (req, res) => res.json(feedbacks));
app.post("/api/feedback", (req, res) => {
  const fb = { id: `FB-${Math.floor(1000 + Math.random() * 9000)}`, ...req.body };
  feedbacks.unshift(fb);
  res.json(fb);
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Backend listening on port ${PORT}`));
