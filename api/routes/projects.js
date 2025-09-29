const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// GET /api/projects - Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/projects/:id - Get a single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// POST /api/projects - Create a new project
router.post("/", async (req, res) => {
  try {
    const projectData = req.body;

    // Generate unique ID if not provided
    if (!projectData.id) {
      projectData.id = Date.now().toString();
    }

    const project = new Project(projectData);
    const savedProject = await project.save();

    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Error creating project:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `A project with this ${field} already exists`,
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

    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT /api/projects/:id - Update a project
router.put("/:id", async (req, res) => {
  try {
    const projectData = req.body;
    projectData.updatedAt = new Date();

    const updatedProject = await Project.findOneAndUpdate(
      { id: req.params.id },
      projectData,
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        error: `A project with this ${field} already exists`,
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

    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({
      id: req.params.id,
    });

    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({
      message: "Project deleted successfully",
      project: deletedProject,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// POST /api/projects/:id/comments - Add a comment to a project
router.post("/:id/comments", async (req, res) => {
  try {
    const { content, authorName, authorEmail, authorAvatar, isClient } =
      req.body;

    if (!content || !authorName || !authorEmail) {
      return res.status(400).json({
        error: "Content, author name, and author email are required",
      });
    }

    const project = await Project.findOne({ id: req.params.id });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const newComment = {
      id: Date.now().toString(),
      content: content.trim(),
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      authorAvatar: authorAvatar || "",
      isClient: isClient || false,
      createdAt: new Date(),
    };

    project.comments.push(newComment);
    project.updatedAt = new Date();

    const savedProject = await project.save();

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
      project: savedProject,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// GET /api/projects/stats/dashboard - Get dashboard statistics
router.get("/stats/dashboard", async (req, res) => {
  try {
    const projects = await Project.find();

    const stats = {
      total: projects.length,
      ongoing: projects.filter((p) => !["done"].includes(p.status)).length,
      completed: projects.filter((p) => p.status === "done").length,
      ongoingRevenue: projects
        .filter((p) => !["done"].includes(p.status))
        .reduce((sum, p) => sum + (p.totalPrice || 0), 0),
      completedRevenue: projects
        .filter((p) => p.status === "done")
        .reduce((sum, p) => sum + (p.totalPrice || 0), 0),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

module.exports = router;
