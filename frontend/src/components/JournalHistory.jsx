import React, { useState, useEffect } from 'react';
import { journalAPI } from '../utils/api';
import { 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  Search, 
  Filter,
  X,
  Brain,
  History,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Trash2
} from 'lucide-react';

const JournalHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await journalAPI.list();
      setEntries(res.data.entries || []);
    } catch (err) {
      console.error('Failed to fetch journal entries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, entryId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      try {
        await journalAPI.delete(entryId);
        setEntries(prev => prev.filter(entry => entry._id !== entryId));
        if (selectedEntry?._id === entryId) {
          setSelectedEntry(null);
        }
      } catch (err) {
        console.error("Failed to delete entry", err);
        alert("Failed to delete entry.");
      }
    }
  };

  const getEmotionIcon = (emotion) => {
    switch (emotion?.toLowerCase()) {
      case 'joy': return <Smile className="w-4 h-4 text-emerald-500" />;
      case 'sadness': return <Frown className="w-4 h-4 text-indigo-500" />;
      case 'anger': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Meh className="w-4 h-4 text-muted" />;
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-1">Archives</h2>
          <h1 className="text-4xl font-black tracking-tight">Journal History</h1>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search patterns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl pl-12 pr-6 py-3.5 text-sm w-full md:w-80 focus:border-indigo-500/50 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEntries.map((entry) => (
            <div 
              key={entry._id}
              onClick={() => setSelectedEntry(entry)}
              className="obsidian-card !p-6 flex items-center justify-between group cursor-pointer hover:bg-[#0f0f0f] transition-all border-[#111]"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-glass rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                  <BookOpen className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                      {entry.content.split('\n')[0].substring(0, 40)}...
                    </h3>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-glass rounded-full border border-borderglass">
                      {getEmotionIcon(entry.dominant_emotion)}
                      <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">
                        {entry.dominant_emotion || 'Analyzing'}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${entry.positivity > 0.6 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : entry.positivity > 0.4 ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                      <span className="text-[10px] font-black tracking-widest uppercase">
                        Score: {Math.round((entry.positivity || 0) * 100)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-muted text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(entry.created_at.endsWith('Z') ? entry.created_at : entry.created_at + 'Z').toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      {new Date(entry.created_at.endsWith('Z') ? entry.created_at : entry.created_at + 'Z').toLocaleTimeString(undefined, { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => handleDelete(e, entry._id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-20 bg-surface border border-dashed border-[#1a1a1a] rounded-[32px]">
              <div className="w-16 h-16 bg-glass rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-gray-700" />
              </div>
              <p className="text-muted font-medium">No records found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedEntry(null)}
          ></div>
          <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-[#1a1a1a] rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-[#1a1a1a] flex items-center justify-between bg-gradient-to-r from-indigo-500/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <BookOpen className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Journal Details</h2>
                  <p className="text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase">
                    Captured: {new Date(selectedEntry.created_at.endsWith('Z') ? selectedEntry.created_at : selectedEntry.created_at + 'Z').toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEntry(null)}
                className="w-10 h-10 bg-glass border border-borderglass rounded-full flex items-center justify-center text-gray-400 hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                  {selectedEntry.content}
                </div>
              </div>

              {/* Analysis Results */}
              <div className="mt-12 pt-8 border-t border-[#1a1a1a] grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-muted uppercase mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Emotional Resonance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold capitalize">{selectedEntry.dominant_emotion}</span>
                      <span className="text-[10px] font-black text-indigo-500">{Math.round(selectedEntry.dominant_intensity * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-glass rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${selectedEntry.dominant_intensity * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-muted uppercase mb-4 flex items-center gap-2">
                    <Smile className="w-3 h-3" />
                    Positivity Index
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-black text-emerald-500">
                      {Math.round(selectedEntry.positivity * 100)}<span className="text-lg opacity-50">%</span>
                    </div>
                    <div className="text-[10px] font-black text-gray-600 uppercase leading-tight tracking-widest">
                      {selectedEntry.positivity > 0.6 ? 'HIGH POSITIVITY' : selectedEntry.positivity > 0.3 ? 'NEUTRAL BALANCE' : 'LOW POSITIVITY'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-surface border-t border-[#1a1a1a] flex justify-end">
              <button 
                onClick={() => setSelectedEntry(null)}
                className="px-8 py-3 bg-glass border border-borderglass rounded-2xl text-[10px] font-black tracking-widest uppercase text-foreground hover:bg-glass brightness-110 transition-all"
              >
                Dismiss Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalHistory;
