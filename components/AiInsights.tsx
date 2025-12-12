
import React, { useState, useEffect } from 'react';
import { UserProfile, CycleData, SymptomLog, HealthReport } from '../types';
import { generateHealthInsights, getChatResponse } from '../services/geminiService';
import { mockBackend } from '../services/mockBackend';
import { Sparkles, Brain, Lock, RefreshCw, AlertCircle, Search, ArrowRight, History, Calendar } from 'lucide-react';

interface AiInsightsProps {
  user: UserProfile;
  cycle: CycleData;
  logs: SymptomLog[];
}

const AiInsights: React.FC<AiInsightsProps> = ({ user, cycle, logs }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<HealthReport[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const reports = await mockBackend.ai.getReports(user.id);
    setHistory(reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()));
    setLoadingHistory(false);
  };

  const handleGenerateInsight = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateHealthInsights(user, logs, cycle);
      setInsight(result);
      
      // Persist to backend
      await mockBackend.ai.saveReport(user.id, result, 'daily_insight');
      
    } catch (err) {
      setError("Failed to generate insight. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResult(null);
    try {
      // Reusing chat response for Q&A search
      const result = await getChatResponse(searchQuery, []);
      setSearchResult(result);
    } catch (e) {
      setSearchResult("Could not find information on that topic.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="pb-24 md:pb-0 space-y-6">
      
      {/* Header with Tab Switcher */}
      <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Brain size={24} className="text-indigo-500" /> AI Insights
            </h2>
          </div>
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex">
             <button 
               onClick={() => setActiveTab('generate')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'generate' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
                Generate
             </button>
             <button 
               onClick={() => setActiveTab('history')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
                History
             </button>
          </div>
      </div>

      {activeTab === 'generate' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Sparkles size={24} className="text-yellow-300" />
                </div>
                <h2 className="text-2xl font-bold">SheThrive AI Intelligence</h2>
              </div>
              <p className="text-indigo-100 max-w-lg mb-6">
                Get personalized health recommendations based on your unique cycle data, symptoms, and goals. 
                Powered by privacy-aware AI.
              </p>
              
              <button
                onClick={handleGenerateInsight}
                disabled={isLoading}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Brain size={20} />
                )}
                {isLoading ? 'Analyzing Data...' : 'Generate New Insight'}
              </button>
            </div>
            
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-500/30 rounded-full blur-2xl"></div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs justify-center">
            <Lock size={12} />
            <span>Your data is anonymized before processing.</span>
          </div>
          
          {/* AI Health Search Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Search size={20} className="text-rose-500" /> Health Knowledge Search
             </h3>
             <form onSubmit={handleSearch} className="relative">
                 <input 
                    type="text" 
                    placeholder="Ask about symptoms, nutrition, or wellness..." 
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:border-rose-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 <button 
                    type="submit"
                    disabled={isSearching || !searchQuery}
                    className="absolute right-2 top-2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors"
                 >
                    {isSearching ? <RefreshCw className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                 </button>
             </form>

             {searchResult && (
                 <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-slate-700 leading-relaxed text-sm animate-fade-in">
                     <p className="font-bold text-indigo-900 mb-1">Answer:</p>
                     {searchResult}
                 </div>
             )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {insight && (
            <div className="animate-fade-in-up bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="bg-rose-100 p-2 rounded-full">
                    <Brain size={20} className="text-rose-600" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800">Your Personalized Analysis</h3>
              </div>
              
              <div className="prose prose-slate prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 marker:text-rose-500">
                {insight.split('\n').map((paragraph, idx) => (
                  <p key={idx} className={`mb-4 ${paragraph.trim().startsWith('-') ? 'pl-4' : ''}`}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Generated by Gemini 2.5 Flash</span>
                <div className="flex gap-2">
                   <button className="text-xs text-slate-500 hover:text-rose-500 border px-3 py-1 rounded-full">Helpful</button>
                   <button className="text-xs text-slate-500 hover:text-slate-900 border px-3 py-1 rounded-full">Not Helpful</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-fade-in space-y-4">
            {loadingHistory ? (
                <div className="text-center py-10 text-slate-400">Loading history...</div>
            ) : history.length === 0 ? (
                <div className="text-center py-12 bg-slate-100 rounded-3xl border border-dashed border-slate-300">
                   <History className="mx-auto text-slate-400 mb-2" size={32} />
                   <p className="text-slate-500">No generated reports yet.</p>
                </div>
            ) : (
                history.map(report => (
                    <div key={report.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2 text-indigo-600 font-bold">
                                <Sparkles size={16} />
                                <span>Health Insight</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Calendar size={12} />
                                {new Date(report.generatedAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="text-slate-600 text-sm line-clamp-3">
                             {report.content.split('\n')[0]}...
                        </div>
                        <button 
                          onClick={() => {
                              setInsight(report.content);
                              setActiveTab('generate'); // Hack to view it in full
                          }}
                          className="mt-4 text-indigo-500 text-sm font-bold hover:text-indigo-700"
                        >
                            Read Full Report
                        </button>
                    </div>
                ))
            )}
        </div>
      )}
    </div>
  );
};

export default AiInsights;
