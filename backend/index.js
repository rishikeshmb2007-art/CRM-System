require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. GLOBAL CORS CONFIGURATION (Idhu thaan gate-a thirakkum)
app.use(cors({
    origin: '*', // Vercel link-a block pannaama irukka
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 2. MIDDLEWARE
app.use(express.json());

// 3. MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('📦 MongoDB Vault Connected Successfully!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 4. DATABASE SCHEMA
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, default: "New" }
}, { timestamps: true });

const Lead = mongoose.model('Lead', leadSchema);

// 5. ROUTES

// Root Route (Checking purpose)
app.get('/', (req, res) => {
  res.send("CRM Backend is Running Live! 🚀");
});

// GET: Fetch all leads
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (err) {
    res.status(500).json({ error: "Data-va edukka mudiyala!" });
  }
});

// POST: Save new lead
app.post('/api/leads', async (req, res) => {
  try {
    console.log("Data coming from Frontend:", req.body); // Render Logs-la check panna
    const newLead = new Lead(req.body);
    const savedLead = await newLead.save();
    res.status(201).json(savedLead);
  } catch (err) {
    res.status(400).json({ error: "Lead save aagala Boss!" });
  }
});

// 6. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});