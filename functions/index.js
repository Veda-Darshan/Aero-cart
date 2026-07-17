// functions/index.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" })); // allow any origin (adjust for prod)
app.use(express.json());

// ----- In‑memory data store -----
let products = [];
let orders = [];
let feedback = [];
let cart = [];

// Seed sample products if empty
const seedProducts = () => {
  if (products.length === 0) {
    products = [
      {
        id: 1,
        name: "Fresh Milk",
        description: "1 liter organic milk",
        price: 45,
        imageUrl: "/assets/milk.png",
        stock: 100,
        category: "Dairy",
        weight: 1.0,
      },
      {
        id: 2,
        name: "Brown Bread",
        description: "Whole grain bread",
        price: 30,
        imageUrl: "/assets/bread.png",
        stock: 50,
        category: "Groceries",
        weight: 0.5,
      },
      {
        id: 3,
        name: "Chocolate Chip Cookies",
        description: "Pack of 6",
        price: 120,
        imageUrl: "/assets/cookies.png",
        stock: 80,
        category: "Snacks",
        weight: 0.3,
      },
    ];
  }
};
seedProducts();

// ---------- Health ----------
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---------- Products ----------
app.get("/api/products", (req, res) => {
  res.json(products);
});

// ---------- Cart ----------
app.get("/api/cart", (req, res) => {
  const expanded = cart.map((c) => {
    const prod = products.find((p) => p.id === c.productId);
    return { ...c, product: prod };
  });
  res.json(expanded);
});

app.post("/api/cart", (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) return res.status(400).json({ error: "productId required" });
  const qty = Number(quantity) || 1;
  const existing = cart.find((c) => c.productId === productId);
  if (existing) existing.quantity += qty;
  else cart.push({ productId, quantity: qty });
  res.json({ message: "added", cart });
});

app.delete("/api/cart/:productId", (req, res) => {
  const pid = Number(req.params.productId);
  cart = cart.filter((c) => c.productId !== pid);
  res.json({ message: "removed", cart });
});

// ---------- Orders ----------
app.post("/api/orders", (req, res) => {
  const { items, address, paymentMethod } = req.body; // items: [{productId, quantity}]
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "order items required" });
  }
  const total = items.reduce((sum, it) => {
    const prod = products.find((p) => p.id === it.productId);
    return sum + (prod?.price || 0) * it.quantity;
  }, 0);
  const order = {
    id: orders.length + 1,
    items,
    total,
    address: address || "",
    paymentMethod: paymentMethod || "COD",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.json({ orderId: order.id, total });
});

app.get("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "order not found" });
  res.json(order);
});

// ---------- Feedback ----------
app.post("/api/feedback", (req, res) => {
  const { orderId, rating, comment } = req.body;
  if (!orderId) return res.status(400).json({ error: "orderId required" });
  const fb = {
    id: feedback.length + 1,
    orderId,
    rating: rating || null,
    comment: comment || "",
    createdAt: new Date().toISOString(),
  };
  feedback.push(fb);
  res.json({ message: "feedback saved" });
});

app.get("/api/feedback/:orderId", (req, res) => {
  const oid = Number(req.params.orderId);
  const rows = feedback.filter((f) => f.orderId === oid);
  res.json(rows);
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Backend listening on port ${PORT}`));
