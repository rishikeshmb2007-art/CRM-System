import React, { useState, useEffect } from 'react';
import './App.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = "https://mini-crm-backend-cmrx.onrender.com/api/leads";
 // Animation text

function App() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('New');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const [aiEmail, setAiEmail] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [animatedEmail, setAnimatedEmail] = useState('');

  // 1. FETCH LEADS
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
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
      } else {
        alert("Failed to save lead.");
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // 3. DELETE LEAD
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead? 🗑️")) return;

    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchLeads();
    } catch (error) {
      console.error("Delete error:", error);
    }
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
    setEditId(null);
    setName('');
    setEmail('');
    setStatus('New');
    setShowModal(false);
  };

  // 5. EXPORT PDF
  const exportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Mini CRM Pro - Leads Report", 14, 15);

      const tableColumn = ["Name", "Email", "AI Priority", "Status"];
      const tableRows = filteredLeads.map(lead => [
        lead.name,
        lead.email,
        calculatePriority(lead),
        lead.status
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        headStyles: {
          fillColor: [102, 252, 241],
          textColor: [11, 12, 16]
        },
      });

      doc.save("CRM_Leads_Report.pdf");
      console.log("PDF Download Triggered!");
    } catch (error) {
      console.error("PDF Generate aagala Boss:", error);
      alert("PDF Error! Console-a check pannunga.");
    }
  };

  // AI PRIORITY LOGIC
  const calculatePriority = (lead) => {
    if (lead.status === "Converted") return "⭐ High (Client)";
    if (lead.status === "Contacted") return "🔥 Warm";
    return "❄️ Cold";
  };

  // ANALYTICS CALCULATIONS
  const totalLeads = leads.length;
  const convertedCount = leads.filter(l => l.status === "Converted").length;
  const successRate = totalLeads === 0
    ? 0
    : ((convertedCount / totalLeads) * 100).toFixed(1);

  // SMART SEARCH & FILTER
  const filteredLeads = leads.filter(lead => {
    const matchSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFilter =
      filterStatus === 'All' || lead.status === filterStatus;

    return matchSearch && matchFilter;
  });

  // AI EMAIL GENERATOR
const handleGenerateEmail = async (leadName, companyName, leadStatus) => {
  setIsGenerating(true);
  setAiEmail('');
  setAnimatedEmail(''); // Pazhaiya animation text clear panna
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadName, companyName, leadStatus }),
    });
    
    const data = await response.json();
    const fullEmail = data.emailContent; // Full content-a variable-la vechukkurom
    
    setAiEmail(fullEmail); // State save update

    // --- TYPING ANIMATION LOGIC START ---
    setIsModalOpen(true); // AI response vandhadhum popup open aaganum
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullEmail.length) {
        setAnimatedEmail((prev) => prev + fullEmail.charAt(index));
        index++;
      } else {
        clearInterval(interval); // Text mudinjadhum stop panna
      }
    }, 20); // Animation speed (20ms per character) - idhai maathikkalam
    // ------------------------------------

  } catch (error) {
    alert("AI Error! Try again Boss!");
    setIsModalOpen(false); // Error vandha popup close aaganum
  } finally {
    setIsGenerating(false);
  }
};

  return (
    <div className="App">
      <header className="header">
        <h1>Mini CRM Pro</h1>

        <div className="header-actions">
          <button className="export-btn" onClick={exportPDF}>
            📄 Export PDF
          </button>

          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Add Lead
          </button>
        </div>
      </header>

      <div className="analytics-board">
        <div className="stat-card">
          <h3>Total Leads</h3>
          <h2>{totalLeads}</h2>
        </div>

        <div className="stat-card">
          <h3>Converted</h3>
          <h2>{convertedCount}</h2>
        </div>

        <div className="stat-card">
          <h3>Success Rate</h3>
          <h2>{successRate}% 🎯</h2>
        </div>
      </div>

      {/* 🔍 Search and Filter Section */}
      {/* 🔍 Search and Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        {/* 🎯 Search Box (Idhu ippo 3 pangu edatha eduthukkum - Semman Neelama irukkum) */}
        <input
          type="text"
          placeholder="Search by name or email..."
          // value={searchQuery} 
          // onChange={(e) => setSearchQuery(e.target.value)} 
          className="md:col-span-3 w-full p-4 bg-gray-800/50 text-white placeholder-gray-400 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-base shadow-sm"
        />

        {/* 🎛️ Filter Dropdown (Idhu 1 pangu edatha eduthukkum) */}
        <select
          // value={filterStatus}
          // onChange={(e) => setFilterStatus(e.target.value)}
          className="md:col-span-1 w-full p-4 bg-gray-800/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer text-base shadow-sm"
        >
          <option value="All" className="bg-gray-800 py-2">All Status</option>
          <option value="New" className="bg-gray-800 py-2">New</option>
          <option value="Contacted" className="bg-gray-800 py-2">Contacted</option>
          <option value="Converted" className="bg-gray-800 py-2">Converted</option>
        </select>

      </div>

      {loading ? (
        <p className="loading">Syncing Data...</p>
      ) : (
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
                    <td>
                      <span className={`status ${lead.status.toLowerCase()}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn edit"
                        onClick={() => openEditModal(lead)}
                      >
                        ✏️
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(lead._id)}
                      >
                        🗑️
                      </button>

                      <button
                        onClick={() =>
                          handleGenerateEmail(
                            lead.name,
                            lead.company || "Your Company",
                            lead.status
                          )
                        }
                        className="bg-indigo-600 text-white px-3 py-1 rounded ml-2"
                      >
                        {isGenerating ? '⌛...' : '✨ AI Email'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No matching leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* OLD AI DISPLAY BOX-A REMOVE PANNITTU INDHA MODAL-A PODUNGA */}

      {/* 🌌 Modern Glassmorphism Modal (Popup) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            
            {/* ✨ Glass Card Container */}
            <div className="relative bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 md:p-8 animate-modalPop">
              
              {/* ❌ Close Button (Top Right) */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full bg-white/10"
              >
                ✕
              </button>

              {/* 🎯 Modal Header */}
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <span className="text-3xl">✨</span>
                <h2 className="text-2xl font-bold text-white tracking-tight">AI Sales Assistant Drafte</h2>
              </div>

              {/* ✍️ Typing Animation Body */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <p className="whitespace-pre-wrap text-white/90 leading-relaxed font-mono text-sm md:text-base">
                  {animatedEmail}
                  {/* 💡 Flashing Cursor effect (Kadaisiya varum) */}
                  <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse"></span>
                </p>
              </div>

              {/* 📦 Modal Footer (Actions) */}
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
                <button 
                  onClick={() => { navigator.clipboard.writeText(aiEmail); alert("Copied Boss!"); }} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
                >
                  📋 Copy to Clipboard
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editId ? "Edit Lead Data" : "Add New Lead"}</h2>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>

            <div className="modal-btns">
              <button onClick={handleSave} className="save-btn">
                {editId ? "Update Lead" : "Save Lead"}
              </button>

              <button onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;