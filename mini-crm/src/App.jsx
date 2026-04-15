import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Plus, Search, Trash2, X, BarChart3, CheckCircle2, Clock, Pencil, Filter, MessageSquare, Send } from 'lucide-react';

function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null); 
  const [noteText, setNoteText] = useState(''); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', source: 'Website', status: 'New' });

  // 1. DATA FETCHING (READ)
  const fetchLeads = () => {
    // Force Redeploy
    fetch('https://mini-crm-backend-cmrx.onrender.com') //Link is added.
      .then(res => res.json())
      .then(data => { setLeads(data); setLoading(false); })
      .catch(err => console.error("Fetch error:", err));
  };

  useEffect(() => { fetchLeads(); }, []);

  // 2. STATS CALCULATION
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const contactedLeads = leads.filter(l => l.status === 'Contacted').length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;

  // 3. SEARCH & FILTER LOGIC
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // 4. ADD & UPDATE LOGIC (CREATE & UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `http://localhost:5000/api/leads/${editingId}` : 'http://localhost:5000/api/leads';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        closeForm();
        fetchLeads();
      }
    } catch (error) { console.error(error); }
  };

  // 5. DELETE LOGIC (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await fetch(`http://localhost:5000/api/leads/${id}`, { method: 'DELETE' });
        fetchLeads();
      } catch (error) { console.error(error); }
    }
  };

  // 6. NOTES LOGIC
  const addNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const response = await fetch(`http://localhost:5000/api/leads/${selectedLead._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: noteText })
      });
      const updatedLead = await response.json();
      setSelectedLead(updatedLead);
      setNoteText('');
      fetchLeads();
    } catch (error) { console.error(error); }
  };

  // UTILITIES
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', source: 'Website', status: 'New' });
  };

  const getStatusColor = (status) => {
    if (status === 'New') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'Contacted') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'Converted') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Mini CRM</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold"><LayoutDashboard size={20} />Dashboard</a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
          <button onClick={showForm ? closeForm : () => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all">
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'Cancel Form' : 'Add New Lead'}
          </button>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Leads" value={totalLeads} icon={<Users className="text-blue-600" />} color="blue" />
            <StatCard title="New" value={newLeads} icon={<BarChart3 className="text-orange-600" />} color="orange" />
            <StatCard title="Contacted" value={contactedLeads} icon={<Clock className="text-yellow-600" />} color="yellow" />
            <StatCard title="Converted" value={convertedLeads} icon={<CheckCircle2 className="text-green-600" />} color="green" />
          </div>

          {/* ADD/EDIT FORM */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-end animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full border p-2 rounded-lg" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" className="w-full border p-2 rounded-lg" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border p-2 rounded-lg" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Converted</option>
                </select>
              </div>
              <button type="submit" className={`${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2.5 rounded-lg font-medium h-[42px] transition-colors`}>
                {editingId ? 'Update Lead' : 'Save Lead'}
              </button>
            </form>
          )}

          {/* TABLE AREA */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* SEARCH & FILTER BAR */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search by name or email..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-72 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select className="border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-5 font-semibold">Name</th>
                  <th className="p-5 font-semibold">Email</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="4" className="p-10 text-center text-gray-500">Loading data... ⏳</td></tr>
                ) : filteredLeads.length === 0 ? (
                  <tr><td colSpan="4" className="p-10 text-center text-gray-500">No leads found.</td></tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-5 font-medium text-gray-900">{lead.name}</td>
                      <td className="p-5 text-gray-500 text-sm">{lead.email}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)}`}>{lead.status}</span>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <button onClick={() => setSelectedLead(lead)} className="text-gray-400 hover:text-green-600 transition-colors p-1" title="View Notes"><MessageSquare size={18} /></button>
                        <button onClick={() => { setEditingId(lead._id); setFormData(lead); setShowForm(true); window.scrollTo(0,0); }} className="text-gray-400 hover:text-blue-600 transition-colors p-1" title="Edit"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(lead._id)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Delete"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* NOTES MODAL */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedLead.name}</h3>
                  <p className="text-sm text-gray-500">{selectedLead.email}</p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-800 transition-colors bg-gray-200 hover:bg-gray-300 p-1.5 rounded-full"><X size={20}/></button>
              </div>
              
              <div className="p-6 h-80 overflow-y-auto space-y-4 bg-gray-50/30">
                {(!selectedLead.notes || selectedLead.notes.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>No notes yet. Add your first note below!</p>
                  </div>
                ) : (
                  selectedLead.notes.map((note, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-gray-800">{note.text}</p>
                      <p className="text-[11px] font-medium text-gray-400 mt-2 uppercase tracking-wider">{new Date(note.date).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={addNote} className="p-4 border-t bg-gray-50 flex gap-3">
                <input required type="text" placeholder="Type a new note..." className="flex-1 border border-gray-300 p-3 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center w-12"><Send size={20} /></button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-Component for Stats
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl bg-${color}-50`}>{icon}</div>
    </div>
  );
}

export default App;