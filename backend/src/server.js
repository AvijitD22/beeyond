require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

// ✅ NEW: Required for socket setup
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

app.get("/api/test", protect, (req, res) => {
  res.json({ message: `Hello ${req.user.role} with ID ${req.user.id}` });
});

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.use('/api/users', require('./routes/userRoutes'));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// ================= SOCKET.IO SETUP =================

// ✅ Create HTTP server from express app
const server = http.createServer(app);

// ✅ Attach socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
console.log("🔥 SOCKET SERVER INITIALIZED");
io.use((socket, next) => {
  // Parse cookies from handshake headers
  const cookies = socket.handshake.headers.cookie;
  console.log("Handshake cookies:", cookies); // 👈 ADD THIS

  if (!cookies) {
    console.log("❌ No cookies - rejecting socket");
    return next(new Error("No cookies sent"));
  }

  // Simple cookie parser (or use cookie lib)
  const tokenCookie = cookies
    .split("; ")
    .find((row) => row.startsWith("token="));
  const token = tokenCookie ? tokenCookie.split("=")[1] : null;

  if (!token) {
    return next(new Error("No token found"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // { id, role }
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// ✅ Optional: make io accessible in controllers
app.set("io", io);

// ✅ Middleware (can be used later for auth)
io.use((socket, next) => {
  console.log("New client attempting connection");
  next();
});

io.on("connection", (socket) => {
  console.log("🔥 SOCKET CONNECTED");

  const { id: userId, role } = socket.user || {};

  console.log("Client connected:", socket.id, userId, role);

  if (role) {
    socket.join(role);
  }

  if (userId) {
    socket.join(`user:${userId}`);
  }

  socket.on("join-order", (orderId) => {
    console.log("Joining order room:", `order:${orderId}`);
    socket.join(`order:${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
