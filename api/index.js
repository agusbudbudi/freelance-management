const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://freelance-management-lyart.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:5500", // For Live Server
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB (only if not already connected)
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("✅ Connected to MongoDB Atlas");
    })
    .catch((error) => {
      console.error("❌ MongoDB connection error:", error);
    });
}

// Routes
const projectRoutes = require("./routes/projects");
app.use("/api/projects", projectRoutes);

// Health check endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Freelance Management API is running!",
    version: "1.0.0",
    endpoints: {
      projects: "/api/projects",
      dashboard: "/api/projects/stats/dashboard",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Export the Express API for Vercel
module.exports = app;
