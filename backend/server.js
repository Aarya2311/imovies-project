require("dotenv").config();

const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { seedMoviesIfNeeded } = require("./data/seedMovies");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const movieRoutes = require("./routes/movieRoutes");

const app = express();
const port = process.env.PORT || 5000;

async function prepareUserRoles() {
  await User.updateMany(
    { $or: [{ role: { $exists: false } }, { role: { $nin: ["customer", "admin", "owner"] } }] },
    { $set: { role: "customer" } }
  );

  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (!ownerEmail && !ownerPassword) {
    return;
  }
  const ownerPasswordLength = ownerPassword ? Buffer.byteLength(ownerPassword, "utf8") : 0;
  if (!ownerEmail || ownerPasswordLength < 12 || ownerPasswordLength > 72) {
    throw new Error(
      "Configure OWNER_EMAIL and OWNER_PASSWORD (12-72 UTF-8 bytes) to bootstrap an owner."
    );
  }

  const existingOwner = await User.findOne({ email: ownerEmail }).select("+passwordHash");
  if (existingOwner) {
    const passwordMatches = await bcrypt.compare(ownerPassword, existingOwner.passwordHash);
    if (!passwordMatches) {
      throw new Error("OWNER_EMAIL already exists with a different password; refusing to change its role.");
    }
    if (existingOwner.role !== "owner") {
      existingOwner.role = "owner";
      await existingOwner.save();
      console.log("Promoted the configured owner account.");
    }
    return;
  }

  await User.create({
    name: process.env.OWNER_NAME?.trim() || "iMovies Owner",
    email: ownerEmail,
    passwordHash: await bcrypt.hash(ownerPassword, 12),
    role: "owner",
  });
  console.log("Created the configured owner account.");
}

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/movies", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

app.use((request, response) => {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` });
});

app.use((error, _request, response, _next) => {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ message: "Request body must contain valid JSON." });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return response.status(400).json({ message: error.message });
  }

  console.error(error);
  response.status(500).json({ message: "An unexpected server error occurred." });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set in the backend environment.");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in the backend environment.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await prepareUserRoles();
  await seedMoviesIfNeeded();
  return app.listen(port, () => {
    console.log(`iMovies API listening on port ${port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Failed to start iMovies API:", error);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
