import React, { useState, useEffect } from 'react';
import './App.css';

// 🔥 UNGA RENDER LINK-A INGA UPDATE PANNUNGA
const API_URL = "https://mini-crm-backend-cmrx.onrender.com/api/leads";

function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null); // Idhu Edit pandrom nu kandupudikka
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('New');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // 1. FETCH LEADS
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setLeads(data);
    } catch (error) { console.error("Fetch error:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  // 2. SAVE OR UPDATE LEAD
  const handleSave = async () => {
    if (!name || !email) return alert("Name and Email required!");
    
    const leadData = { name, email, status };
    const method = editId ? 'PUT' : 'POST';
    const URL = editId ? `${API_URL}/${editId}` : API_URL;

    try {
      const res = await fetch(URL, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      if (res.ok) {
        fetchLeads();
        resetForm();
      } else { alert("Failed to save lead."); }
    } catch (error) { console.error("Save error:", error); }
  };

  // 3. DELETE LEAD
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead? 🗑️")) return;
    
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchLeads();
    } catch (error) { console.error("Delete error:", error); }
  };

  // 4. PREPARE EDIT
  const openEditModal = (lead) => {
    setEditId(lead._id);
    setName(lead.name);
    setEmail(lead.email);
    setStatus(lead.status);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditId(null); setName(''); setEmail(''); setStatus('New'); setShowModal(false);
  };

  // 5. EXPORT CSV
  const exportCSV = () => {
    const headers = ["Name,Email,Status,AI_Priority"];
    const csvData = filteredLeads.map(l => `${l.name},${l.email},${l.status},${calculatePriority(l)}`);
    const blob = new Blob([headers.concat(csvData).join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'CRM_Leads_Report.csv');
    a.click();
  };

  // 🤖 AI PRIORITY LOGIC
  const calculatePriority = (lead) => {
    if (lead.status === "Converted") return "⭐ High (Client)";
    if (lead.status === "Contacted") return "🔥 Warm";
    return "❄️ Cold";
  };

  // 📊 ANALYTICS CALCULATIONS
  const totalLeads = leads.length;
  const convertedCount = leads.filter(l => l.status === "Converted").length;
  const successRate = totalLeads === 0 ? 0 : ((convertedCount / totalLeads) * 100).toFixed(1);

  // 🔍 SMART SEARCH & FILTER
  const filteredLeads = leads.filter(lead => {
    const matchSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'All' || lead.status === filterStatus;
    return matchSearch && matchFilter;
  });

  return (
    <div className="App">
      <header className="header">
        <h1>Mini CRM Pro</h1>
        <div className="header-actions">
          <button className="export-btn" onClick={exportCSV}>📥 Export CSV</button>
          <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Lead</button>
        </div>
      </header>

      {/* 📊 ANALYTICS DASHBOARD */}
      <div className="analytics-board">
        <div className="stat-card"><h3>Total Leads</h3><h2>{totalLeads}</h2></div>
        <div className="stat-card"><h3>Converted</h3><h2>{convertedCount}</h2></div>
        <div className="stat-card"><h3>Success Rate</h3><h2>{successRate}% 🎯</h2></div>
      </div>

      {/* 🔍 SEARCH & FILTER BAR */}
      <div className="toolbar">
        <input 
          type="text" placeholder="🔍 Search by name or email..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
          className="search-bar"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="All">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Converted">Converted</option>
        </select>
      </div>

      {/* 📋 TABLE */}
      {loading ? ( <p className="loading">Syncing Data...</p> ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>AI Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{calculatePriority(lead)}</td>
                    <td><span className={`status ${lead.status.toLowerCase()}`}>{lead.status}</span></td>
                    <td>
                      <button className="action-btn edit" onClick={() => openEditModal(lead)}>✏️</button>
                      <button className="action-btn delete" onClick={() => handleDelete(lead._id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              ) : ( <tr><td colSpan="5">No matching leads found.</td></tr> )}
            </tbody>
          </table>
        </div>
      )}

      {/* 📝 MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editId ? "Edit Lead Data" : "Add New Lead"}</h2>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>
            <div className="modal-btns">
              <button onClick={handleSave} className="save-btn">{editId ? "Update Lead" : "Save Lead"}</button>
              <button onClick={resetForm} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;