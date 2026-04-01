require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require("bcrypt");

const Assignment = require('./models/Assignment');
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));



const eventSchema = new mongoose.Schema({
  EventID: String,
  UserID: { type: String, default: "Test" },
  Title: { type: String, required: true },
  Module: String,
  Date: Date,
  Time: String,
  EndTime: String,
  Day: String,
  Category: { type: String, required: true },
  reminderTime: { type: String, default: "1 Hr" }
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);



//  Assignments
app.get('/api/assignments', async (req, res) => {
  const assignments = await Assignment.find().sort({ dueDate: 1 });
  res.json(assignments);
});

app.post('/api/assignments', async (req, res) => {
  const { title, module, dueDate } = req.body;
  const assignment = new Assignment({ title, module, dueDate });
  await assignment.save();
  res.status(201).json(assignment);
});

app.delete('/api/assignments/:id', async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});


// Events
app.get("/api/events", async (req, res) => {
  const events = await Event.find().sort({ Date: 1 });
  res.json(events);
});

app.post("/api/events", async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  res.status(201).json(event);
});

app.delete("/api/events/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});



app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  await new User({ email, password: hash }).save();

  res.status(201).json({ message: "Account created" });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  res.json({ message: "Login successful" });
});






app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});