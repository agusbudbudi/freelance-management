const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
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

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Routes
const projectRoutes = require("./routes/projects");
const clientRoutes = require("./routes/clients");
const serviceRoutes = require("./routes/services");
const authRoutes = require("./routes/auth");
app.use("/api/projects", projectRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Freelance Management API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      projects: "/api/projects",
      clients: "/api/clients",
      services: "/api/services",
      dashboard: "/api/projects/stats/dashboard",
    },
  });
});

// Serve the main HTML file for any non-API routes
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server for local development
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export the Express API for Vercel
module.exports = app;
