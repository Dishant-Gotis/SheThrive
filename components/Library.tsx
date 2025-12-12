
import React, { useState, useEffect } from 'react';
import { Article, UserContentProgress } from '../types';
import { useAuth } from '../context/AuthContext';
import { mockBackend } from '../services/mockBackend';
import { BookOpen, Search, Clock, Tag, ChevronRight, CheckCircle2 } from 'lucide-react';

const Library: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [progress, setProgress] = useState<UserContentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    loadContent();
  }, [user]);

  const loadContent = async () => {
    setLoading(true);
    const [arts, prog] = await Promise.all([
      mockBackend.content.getArticles(),
      user ? mockBackend.content.getUserProgress(user.id) : Promise.resolve([])
    ]);
    setArticles(arts);
    setProgress(prog);
    setLoading(false);
  };

  const handleRead = async (article: Article) => {
    setSelectedArticle(article);
    if (user) {
        await mockBackend.content.updateProgress(user.id, article.id, 'started');
    }
  };

  const handleComplete = async () => {
      if (user && selectedArticle) {
          await mockBackend.content.updateProgress(user.id, selectedArticle.id, 'completed');
          loadContent(); // Refresh status
          setSelectedArticle(null);
      }
  };

  const isCompleted = (id: string) => progress.find(p => p.contentId === id)?.status === 'completed';

  const filteredArticles = articles.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase()) || 
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (selectedArticle) {
      return (
          <div className="pb-20 animate-fade-in">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="mb-6 text-slate-500 hover:text-rose-500 font-bold flex items-center gap-2"
              >
                  <ChevronRight className="rotate-180" size={20} /> Back to Library
              </button>
              
              <article className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-3xl mx-auto">
                  <div className="relative h-64 w-full mb-8 rounded-2xl overflow-hidden">
                      <img src={selectedArticle.thumbnailUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                      {selectedArticle.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                              {tag}
                          </span>
                      ))}
                  </div>

                  <h1 className="text-3xl font-bold text-slate-900 mb-4">{selectedArticle.title}</h1>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
                      <span>By {selectedArticle.author}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {selectedArticle.readTimeMinutes} min read</span>
                  </div>

                  <div className="prose prose-slate prose-lg mb-12" dangerouslySetInnerHTML={{ __html: selectedArticle.content }}></div>

                  <button 
                    onClick={handleComplete}
                    className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                  >
                      <CheckCircle2 size={20} /> Mark as Completed
                  </button>
              </article>
          </div>
      );
  }

  return (
    <div className="pb-24 md:pb-0 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
             <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                 <BookOpen size={32} className="text-rose-500" /> Library
             </h2>
             <p className="text-slate-500 mt-2">Expert-vetted resources for your health journey.</p>
          </div>
          
          <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                 type="text" 
                 placeholder="Search topics..."
                 className="w-full pl-10 p-3 rounded-xl border border-slate-200 focus:border-rose-500 outline-none"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
          </div>
      </div>

      {loading ? (
          <div className="text-center py-20 text-slate-400">Loading library...</div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                  <div 
                    key={article.id} 
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
                    onClick={() => handleRead(article)}
                  >
                      <div className="h-48 bg-slate-100 relative">
                          <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover" />
                          {isCompleted(article.id) && (
                              <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Read
                              </div>
                          )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                          <div className="flex gap-2 mb-3">
                             {article.tags.slice(0, 2).map(t => (
                                 <span key={t} className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{t}</span>
                             ))}
                          </div>
                          <h3 className="font-bold text-slate-900 text-lg mb-2">{article.title}</h3>
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{article.description}</p>
                          <div className="flex items-center justify-between text-xs text-slate-400 mt-auto">
                              <span>{article.author}</span>
                              <span className="flex items-center gap-1"><Clock size={12} /> {article.readTimeMinutes} min</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Library;
