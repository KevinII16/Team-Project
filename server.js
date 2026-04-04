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

// mongodb
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// SCHOOL
const classSchema = new mongoose.Schema({
  userEmail: String,
  name: String,
  day: Number,
  time: String,
  week: Number
}, { timestamps: true });

const Class = mongoose.model("Class", classSchema);

app.get("/api/classes", async (req, res) => {
  const { userEmail } = req.query;
  const classes = await Class.find({ userEmail });
  res.json(classes);
});

app.post("/api/classes", async (req, res) => {
  const { name, day, time, week, userEmail } = req.body;
  const newClass = new Class({ name, day, time, week, userEmail });
  await newClass.save();
  res.status(201).json(newClass);
});

app.delete("/api/classes/:id", async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// WORK
const workSchema = new mongoose.Schema({
  userEmail: String,
  day: Number,
  start: String,
  end: String,
  rate: Number,
  total: Number
}, { timestamps: true });

const Work = mongoose.model("Work", workSchema);

app.get("/api/work", async (req, res) => {
  const { userEmail } = req.query;
  const shifts = await Work.find({ userEmail });
  res.json(shifts);
});

app.post("/api/work", async (req, res) => {
  const { day, start, end, rate, total, userEmail } = req.body;

  await Work.findOneAndUpdate(
    { day, userEmail },
    { day, start, end, rate, total, userEmail },
    { upsert: true, new: true }
  );

  res.json({ message: "Saved" });
});

app.delete("/api/work/:id", async (req, res) => {
  await Work.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ASSIGNMENTS
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

// AUTH
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

// routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});