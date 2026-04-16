require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Middlewares
app.use(express.json());
const cors = require('cors');

// Intha configuration-a apdiye podunga
app.use(cors({
  origin: '*', // Yar venaalum request anupalaam
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Idhuvum mukkiyam! // Browser block pannama irukka

// 2. MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('📦 MongoDB Vault Connected Successfully!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 3. Database Schema & Model
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, default: "New" }
}, { timestamps: true });

const Lead = mongoose.model('Lead', leadSchema);

// 4. Routes

// GET: Ellaa leads-aiyum edukka (Browser-la paakkalaam)
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (err) {
    res.status(500).json({ error: "Data-va edukka mudiyala Boss!" });
  }
});

// POST: Pudhu lead add panna
app.get('/', (req, res) => {
    res.send("CRM Backend is Running Live! 🚀");
});

app.post('/api/leads', async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    const savedLead = await newLead.save();
    res.status(201).json(savedLead);
  } catch (err) {
    res.status(400).json({ error: "Lead add panna mudiyala!" });
  }
});

// 5. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});