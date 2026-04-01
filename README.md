# StudySync MongoDB Midpoint Version

This is a small Express + MongoDB version of your StudySync prototype.

## What is connected
- Assignments page is connected to MongoDB
- You can add assignments
- You can delete assignments
- Dashboard reads assignment count and next due item

## Setup
1. Open the project folder in VS Code
2. Run `npm install`
3. Create a `.env` file based on `.env.example`
4. Paste your MongoDB connection string into `MONGO_URI`
5. Run `npm start`
6. Open `http://localhost:3000`

## Why this version is good for midpoint
It keeps your existing student project structure but shows real backend persistence on one core feature without overcomplicating the whole app.
