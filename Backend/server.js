// 🔒 Node.js version lock
const requiredVersion = "22.17.0";
const currentVersion = process.versions.node;

if (currentVersion !== requiredVersion) {
  console.error(`❌ Wrong Node.js version! Required ${requiredVersion}, but running ${currentVersion}`);
  process.exit(1);
}

// 🚀 Import required modules
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

// 📂 Load environment variables
dotenv.config();

// ⚡ Create Express app
const app = express();

// ⚡ Middleware stack
app.use(express.json());
app.use(cors({
  origin: "*", // 🔓 allow all for now, tighten later
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(helmet({
  contentSecurityPolicy: false, // disable CSP for API flexibility
}));

// ⚡ Rate limiter (anti-DDoS)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200, // 200 requests per 10 mins
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ⚡ Async wrapper (avoid try/catch everywhere)
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ✅ Root route
app.get("/", (req, res) => {
  res.json({
    status: "✅ OK",
    message: "🚀 Mine App Backend running on Node.js v22.17.0",
    uptime: process.uptime().toFixed(0) + "s",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Health check route
app.get("/health", (req, res) => {
  res.json({ status: "healthy", version: requiredVersion });
});

// ✅ Example external API call (Axios)
app.get("/api/joke", asyncHandler(async (req, res) => {
  const { data } = await axios.get("https://official-joke-api.appspot.com/jokes/random");
  res.json({ joke: data });
}));

// ⚡ Centralized error handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// ⚡ Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
