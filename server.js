require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ dueDate: 1, createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load assignments.' });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const { title, module, dueDate } = req.body;

    if (!title || !module || !dueDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const assignment = new Assignment({ title, module, dueDate });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save assignment.' });
  }
});

app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!deletedAssignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    res.json({ message: 'Assignment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete assignment.' });
  }
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/assignments.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assignments.html'));
});

app.get('/school.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'school.html'));
});

app.get('/work.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'work.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function startServer() {
  if (!MONGO_URI) {
    console.error('Missing MONGO_URI. Add it to your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
