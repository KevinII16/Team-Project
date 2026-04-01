require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Event schema
const eventSchema = new mongoose.Schema(
  {
    EventID: { type: String, default: "" },
    UserID: { type: String, default: "Test" },
    Title: { type: String, required: true },
    Module: { type: String, default: "" },
    Date: { type: Date, default: null },
    Time: { type: String, default: "" },
    EndTime: { type: String, default: "" },
    Day: { type: String, default: "" },
    Category: { type: String, required: true },
    reminderTime: { type: String, default: "1 Hr" }
  },
  {
    collection: "Events",
    timestamps: true
  }
);

const Event = mongoose.model("Event", eventSchema);

// Routes

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get all events or filter by category
app.get("/api/events", async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.Category = req.query.category;
    }

    const events = await Event.find(filter).sort({ Date: 1, createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// Get one event by id
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// Create new event
app.post("/api/events", async (req, res) => {
  try {
    const body = req.body;

    const newEvent = new Event({
      EventID: body.EventID || "",
      UserID: body.UserID || "Test",
      Title: body.Title || body.title || "",
      Module: body.Module || body.module || "",
      Date: body.Date || body.date || body.dueDate || null,
      Time: body.Time || body.time || body.startTime || "",
      EndTime: body.EndTime || body.endTime || "",
      Day: body.Day || body.day || "",
      Category: body.Category || body.category || "General",
      reminderTime: body.reminderTime || body.reminder || "1 Hr"
    });

    if (!newEvent.Title || !newEvent.Category) {
      return res.status(400).json({
        message: "Title and Category are required"
      });
    }

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

// Delete event
app.delete("/api/events/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});