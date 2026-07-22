import { useState } from 'react';
import { MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, Search, ChevronRight, Send, X } from 'lucide-react';
import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_COMPLAINTS: Complaint[] = [
  {
    id: 'c1', ticketNo: 'TKT-001',
    title: 'Missing marks for Mathematics Term 1',
    description: "My child's Mathematics score was not recorded for Term 1. We received the report card but Maths shows 0.",
    category: 'academic', priority: 'high', status: 'in_review',
    submittedBy: 'parent1', submitterName: 'Mr. Mbah', submitterRole: 'parent',
    messages: [
      { id: 'm1', senderId: 'parent1', senderName: 'Mr. Mbah', senderRole: 'parent', message: "We urgently need this corrected before the ranking is finalised.", sentAt: '2026-07-10T09:00:00Z' },
      { id: 'm2', senderId: 'admin1', senderName: 'Admin', senderRole: 'admin', message: "We have received your complaint and are investigating. The teacher will be contacted today.", sentAt: '2026-07-10T11:30:00Z' },
    ],
    createdAt: '2026-07-10T08:45:00Z', updatedAt: '2026-07-10T11:30:00Z',
  },
  {
    id: 'c2', ticketNo: 'TKT-002',
    title: 'Duplicate fee payment recorded',
    description: 'I made a payment via MTN MoMo on July 5th but it appears twice on the system.',
    category: 'financial', priority: 'urgent', status: 'open',
    submittedBy: 'parent2', submitterName: 'Mrs. Fotso', submitterRole: 'parent',
    messages: [],
    createdAt: '2026-07-11T14:00:00Z', updatedAt: '2026-07-11T14:00:00Z',
  },
  {
    id: 'c3', ticketNo: 'TKT-003',
    title: 'Broken chairs in Form 2 classroom',
    description: 'Several chairs in Form 2A are broken and are a safety hazard for the students.',
    category: 'facility', priority: 'medium', status: 'resolved',
    submittedBy: 'teacher1', submitterName: 'Mr. Tchamba', submitterRole: 'teacher',
    messages: [
      { id: 'm3', senderId: 'teacher1', senderName: 'Mr. Tchamba', senderRole: 'teacher', message: "This has been an ongoing issue for two weeks now.", sentAt: '2026-07-08T10:00:00Z' },
      { id: 'm4', senderId: 'admin1', senderName: 'Admin', senderRole: 'admin', message: "Replacement chairs have been ordered and will be delivered tomorrow.", sentAt: '2026-07-09T08:00:00Z' },
    ],
    createdAt: '2026-07-08T09:30:00Z', updatedAt: '2026-07-09T08:00:00Z', resolvedAt: '2026-07-09T08:00:00Z',
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ComplaintStatus, { label: string; icon: React.ReactNode; color: string }> = {
  open:      { label: 'Open',      icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'bg-red-100 text-red-700 border-red-200' },
  in_review: { label: 'In Review', icon: <Clock className="w-3.5 h-3.5" />,       color: 'bg-amber-100 text-amber-700 border-amber-200' },
  resolved:  { label: 'Resolved',  icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-green-100 text-green-700 border-green-200' },
  closed:    { label: 'Closed',    icon: <X className="w-3.5 h-3.5" />,            color: 'bg-slate-100 text-slate-600 border-slate-200' },
};
const PRIORITY_COLORS: Record<ComplaintPriority, string> = {
  low: 'bg-slate-100 text-slate-600', medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700 font-bold',
};
const CATEGORIES: ComplaintCategory[] = ['academic', 'financial', 'disciplinary', 'facility', 'other'];

// ─── Component ────────────────────────────────────────────────────────────────
export function ComplaintsHub() {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'bursar';

  const [complaints, setComplaints] = useState<Complaint[]>(SEED_COMPLAINTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [draft, setDraft] = useState({ title: '', description: '', category: 'academic' as ComplaintCategory, priority: 'medium' as ComplaintPriority });

  const selected = complaints.find(c => c.id === selectedId);

  const filtered = complaints.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.ticketNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    // Non-staff only see their own
    const matchOwner = isStaff || c.submittedBy === (user?.id ?? '');
    return matchSearch && matchStatus && matchOwner;
  });

  const handleNewComplaint = () => {
    const newTicket: Complaint = {
      id: Date.now().toString(),
      ticketNo: `TKT-${String(complaints.length + 1).padStart(3, '0')}`,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      priority: draft.priority,
      status: 'open',
      submittedBy: user?.id ?? 'demo',
      submitterName: `${user?.firstName ?? 'User'} ${user?.lastName ?? ''}`.trim(),
      submitterRole: user?.role ?? 'parent',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComplaints(prev => [newTicket, ...prev]);
    setShowNewModal(false);
    setDraft({ title: '', description: '', category: 'academic', priority: 'medium' });
    setSelectedId(newTicket.id);
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedId) return;
    const msg = {
      id: Date.now().toString(),
      senderId: user?.id ?? 'demo',
      senderName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'User',
      senderRole: user?.role ?? 'parent',
      message: replyText.trim(),
      sentAt: new Date().toISOString(),
    };
    setComplaints(prev => prev.map(c =>
      c.id === selectedId
        ? { ...c, messages: [...c.messages, msg], updatedAt: new Date().toISOString() }
        : c
    ));
    setReplyText('');
  };

  const handleStatusChange = (id: string, status: ComplaintStatus) => {
    setComplaints(prev => prev.map(c =>
      c.id === id ? { ...c, status, updatedAt: new Date().toISOString(), resolvedAt: status === 'resolved' ? new Date().toISOString() : c.resolvedAt } : c
    ));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Complaints & Support</h1>
          <p className="text-slate-600">{isStaff ? 'Manage incoming tickets.' : 'Submit and track your complaints.'}</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Complaint
        </button>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Ticket List */}
        <div className={`flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-96 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0`}>
          {/* Search + filter */}
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-primary focus:border-primary"
                placeholder="Search tickets…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {(['all', 'open', 'in_review', 'resolved'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    filterStatus === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_CONFIG[s as ComplaintStatus].label}
                </button>
              ))}
            </div>
          </div>
          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No tickets found.</div>
            ) : filtered.map(c => {
              const { label, icon, color } = STATUS_CONFIG[c.status];
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedId === c.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-medium text-slate-800 text-sm line-clamp-1">{c.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{c.ticketNo} · {c.submitterName}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${color}`}>{icon}{label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{c.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail / Thread view */}
        {selectedId && selected ? (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => setSelectedId(null)} className="md:hidden p-1 text-slate-400 hover:text-primary">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <span className="text-xs font-mono text-slate-500">{selected.ticketNo}</span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selected.status].color}`}>
                    {STATUS_CONFIG[selected.status].icon}{STATUS_CONFIG[selected.status].label}
                  </span>
                </div>
                <h2 className="font-bold text-slate-800">{selected.title}</h2>
                <p className="text-xs text-slate-500 mt-1">Submitted by {selected.submitterName} · {new Date(selected.createdAt).toLocaleDateString()}</p>
              </div>
              {/* Status control for staff */}
              {isStaff && (
                <select
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white shrink-0"
                  value={selected.status}
                  onChange={e => handleStatusChange(selected.id, e.target.value as ComplaintStatus)}
                >
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              )}
            </div>

            {/* Description + thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Original message */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Original Complaint</p>
                <p className="text-slate-700 text-sm leading-relaxed">{selected.description}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PRIORITY_COLORS[selected.priority]}`}>Priority: {selected.priority}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 capitalize">Category: {selected.category}</span>
                </div>
              </div>

              {/* Message thread */}
              {selected.messages.map(msg => {
                const isOwn = msg.senderId === (user?.id ?? '');
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isOwn ? 'bg-primary text-white' : 'bg-slate-100 text-slate-800'}`}>
                      <p className={`text-xs mb-1.5 font-medium ${isOwn ? 'text-primary-foreground/70' : 'text-slate-500'}`}>
                        {msg.senderName} · {msg.senderRole}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-1.5 ${isOwn ? 'text-primary-foreground/60 text-right' : 'text-slate-400'}`}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply box — disabled if closed */}
            {selected.status !== 'closed' && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                <textarea
                  rows={2}
                  className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm resize-none focus:ring-primary focus:border-primary"
                  placeholder="Type your reply…"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); }}}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 self-end"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:flex flex-1 bg-white rounded-xl border border-slate-200 shadow-sm items-center justify-center">
            <div className="text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a ticket to view the conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Submit a Complaint</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                  placeholder="Brief summary of your complaint"
                  value={draft.title}
                  onChange={e => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white capitalize"
                    value={draft.category}
                    onChange={e => setDraft({ ...draft, category: e.target.value as ComplaintCategory })}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white capitalize"
                    value={draft.priority}
                    onChange={e => setDraft({ ...draft, priority: e.target.value as ComplaintPriority })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-primary focus:border-primary"
                  placeholder="Describe your complaint in detail…"
                  value={draft.description}
                  onChange={e => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              <button
                onClick={handleNewComplaint}
                disabled={!draft.title || !draft.description}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
