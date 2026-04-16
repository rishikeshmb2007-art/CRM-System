import React, { useState, useEffect } from 'react';
import './App.css';

// ⚠️ UNGA RENDER LINK-A INGA CHECK PANNIKONGA
// 🔥 INTHA LINK-A APDIYE COPY-PASTE PANNUNGA:
const API_URL = "https://mini-crm-backend-cmrx.onrender.com/api/leads";

function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('New');

  // 1. Fetch Leads (GET)
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // 2. Add Lead (POST)
  const addLead = async (leadData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      if (response.ok) {
        fetchLeads(); // Refresh table
        setShowModal(false); // Close modal
        setName(''); setEmail(''); setStatus('New'); // Reset fields
        alert("Lead Saved Successfully! ✅");
      } else {
        alert("Save panna mudiyala Boss! Check Backend.");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // 3. Handle Save Button Click
  const handleSave = () => {
    if (!name || !email) {
      alert("Please fill name and email!");
      return;
    }
    const newLead = { name, email, status };
    addLead(newLead);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Mini CRM Dashboard</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add New Lead</button>
      </header>

      {loading ? (
        <p className="loading">Loading data from Render... (Wait 30s)</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td><span className={`status ${lead.status.toLowerCase()}`}>{lead.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No leads found. Click Add Lead!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FOR ADDING LEAD */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Lead</h2>
            <input 
              type="text" placeholder="Name" 
              value={name} onChange={(e) => setName(e.target.value)} 
            />
            <input 
              type="email" placeholder="Email" 
              value={email} onChange={(e) => setEmail(e.target.value)} 
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>
            <div className="modal-btns">
              <button onClick={handleSave} className="save-btn">Save Lead</button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;