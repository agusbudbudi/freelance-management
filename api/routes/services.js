const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

// GET all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET single service
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

// POST new service
router.post("/", async (req, res) => {
  try {
    const serviceData = req.body;

    // Generate unique ID if not provided
    if (!serviceData.id) {
      serviceData.id = Date.now().toString();
    }

    const service = new Service(serviceData);
    const savedService = await service.save();

    res.status(201).json(savedService);
  } catch (error) {
    console.error("Error creating service:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `A service with this ${field} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    res.status(500).json({ error: "Failed to create service" });
  }
});

// PUT update service
router.put("/:id", async (req, res) => {
  try {
    const serviceData = req.body;
    serviceData.updatedAt = new Date();

    const updatedService = await Service.findOneAndUpdate(
      { id: req.params.id },
      serviceData,
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `A service with this ${field} already exists`,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE service
router.delete("/:id", async (req, res) => {
  try {
    const deletedService = await Service.findOneAndDelete({
      id: req.params.id,
    });

    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({
      message: "Service deleted successfully",
      service: deletedService,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service" });
  }
});

module.exports = router;
