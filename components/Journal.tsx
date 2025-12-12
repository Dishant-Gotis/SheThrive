
import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { mockBackend } from '../services/mockBackend';
import { Lock, Plus, Trash2, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const Journal: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // UI State
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadEntries();
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await mockBackend.journal.getEntries(user.id);
    setEntries(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user || !title || !content) return;
    await mockBackend.journal.createEntry(user.id, {
      title,
      content,
      entryDate: new Date().toISOString()
    });
    setIsCreating(false);
    setTitle('');
    setContent('');
    loadEntries();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      await mockBackend.journal.deleteEntry(id);
      loadEntries();
    }
  };

  if (!user) return null;

  return (
    <div className="pb-24 md:pb-0 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Health Journal <Lock size={20} className="text-emerald-500" />
          </h2>
          <p className="text-slate-500 text-sm">Your private, encrypted space for reflection.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          {isCreating ? 'Cancel' : <><Plus size={18} /> New Entry</>}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fade-in-up">
          <input
            type="text"
            placeholder="Title (e.g., Morning Reflection)"
            className="w-full text-lg font-bold mb-4 p-2 border-b border-slate-100 focus:border-rose-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Write your thoughts here..."
            className="w-full h-40 resize-none p-2 mb-4 text-slate-700 focus:outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-rose-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-600 transition-all"
            >
              Save to Encrypted Vault
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-slate-400">Loading entries...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-slate-100 rounded-3xl border border-dashed border-slate-300">
            <FileText className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-slate-500">No journal entries yet.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div 
              key={entry.id} 
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer"
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            >
              <div className="p-5 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{entry.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Calendar size={12} />
                    <span>{new Date(entry.entryDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{new Date(entry.entryDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={(e) => handleDelete(entry.id, e)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2"
                    >
                        <Trash2 size={18} />
                    </button>
                    {expandedId === entry.id ? <ChevronUp className="text-slate-400" size={20} /> : <ChevronDown className="text-slate-400" size={20} />}
                </div>
              </div>
              
              {expandedId === entry.id && (
                <div className="px-5 pb-5 pt-0 text-slate-600 leading-relaxed whitespace-pre-wrap animate-fade-in border-t border-slate-50 mt-2 pt-4">
                   {entry.content}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Journal;
