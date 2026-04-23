require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { generateEmail } = require('./controllers/aiController');
const app = express();

// 🚀 NUCLEAR CORS FIX
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// 📦 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('📦 MongoDB Connected Successfully!'))
  .catch((err) => console.error('❌ Error:', err));

const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  status: { type: String, default: "New" }
}, { timestamps: true });

const Lead = mongoose.model('Lead', leadSchema);

// 🌐 ROUTES

// 1. GET: Fetch all
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) { res.status(500).json({ error: "Fetch error" }); }
});

// 2. POST: Create Lead
app.post('/api/leads', async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save();
    res.status(201).json(newLead);
  } catch (err) { res.status(400).json({ error: "Save error" }); }
});

// AI Email Route
app.post('/api/generate-email', generateEmail);

// 3. PUT: Update Lead (PUDHUSU 🔥)
app.put('/api/leads/:id', async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLead);
  } catch (err) { res.status(400).json({ error: "Update error" }); }
});

// 4. DELETE: Remove Lead (PUDHUSU 🔥)
app.delete('/api/leads/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: "Lead Deleted" });
  } catch (err) { res.status(400).json({ error: "Delete error" }); }
});

app.get('/', (req, res) => res.send("CRM Backend is Live! 🚀"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));