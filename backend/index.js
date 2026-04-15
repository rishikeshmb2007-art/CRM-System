require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Intha line-a nalla check pannunga
app.use(cors({
    origin: "*", // Idhu ulagathula irukka endha domain-laiyum allow pannum
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

const app = express();
app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('📦 MongoDB Vault Connected Successfully!'))
  .catch((err) => console.error('❌ Error:', err));

// Database Schema
const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  source: String,
  status: { type: String, default: 'New' },
  notes: [{ text: String, date: { type: Date, default: Date.now } }] 
});

const Lead = mongoose.model('Lead', leadSchema);

// --- ROUTES ---

// 1. GET ALL
app.get('/api/leads', async (req, res) => {
  try {
    const allLeads = await Lead.find().sort({ _id: -1 }); // Pudhus ah add panrathu mela varum
    res.json(allLeads);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// 2. CREATE NEW
app.post('/api/leads', async (req, res) => {
  try {
    const newLead = new Lead(req.body); 
    await newLead.save(); 
    res.status(201).json(newLead);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// 3. ADD NOTE TO LEAD
app.post('/api/leads/:id/notes', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    lead.notes.push({ text: req.body.text }); 
    await lead.save();
    res.json(lead);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// 4. UPDATE LEAD
app.put('/api/leads/:id', async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLead);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// 5. DELETE LEAD
app.delete('/api/leads/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted!' });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// START SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});