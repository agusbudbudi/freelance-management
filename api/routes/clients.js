const express = require("express");
const router = express.Router();
const Client = require("../models/Client");

// GET /api/clients - Get all clients
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// GET /api/clients/:id - Get a single client
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findOne({ id: req.params.id });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Failed to fetch client" });
  }
});

// POST /api/clients - Create a new client
router.post("/", async (req, res) => {
  try {
    const clientData = req.body;

    // Generate unique ID if not provided
    if (!clientData.id) {
      clientData.id = Date.now().toString();
    }

    const client = new Client(clientData);
    const savedClient = await client.save();

    res.status(201).json(savedClient);
  } catch (error) {
    console.error("Error creating client:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `A client with this ${field} already exists`,
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

    res.status(500).json({ error: "Failed to create client" });
  }
});

// PUT /api/clients/:id - Update a client
router.put("/:id", async (req, res) => {
  try {
    const clientData = req.body;
    clientData.updatedAt = new Date();

    const updatedClient = await Client.findOneAndUpdate(
      { id: req.params.id },
      clientData,
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `A client with this ${field} already exists`,
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

    res.status(500).json({ error: "Failed to update client" });
  }
});

// DELETE /api/clients/:id - Delete a client
router.delete("/:id", async (req, res) => {
  try {
    const deletedClient = await Client.findOneAndDelete({
      id: req.params.id,
    });

    if (!deletedClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({
      message: "Client deleted successfully",
      client: deletedClient,
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

module.exports = router;
