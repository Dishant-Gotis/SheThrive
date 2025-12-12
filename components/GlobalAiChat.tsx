
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Minimize2, Flower } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const GlobalAiChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: "Hi bestie! 💖 I'm your health assistant. How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Format history for Gemini
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    try {
        const responseText = await getChatResponse(input, history);
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
        setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
        const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: "I'm having trouble connecting right now. Please try again later." };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Custom text formatter to handle bold (**text**) and lists (* item)
  const formatMessageText = (text: string) => {
    const lines = text.split('\n');
    let inList = false;

    return lines.map((line, index) => {
      // Handle Lists
      const listMatch = line.match(/^[\*\-]\s+(.*)/);
      if (listMatch) {
        // Replace bold syntax within list item
        const content = listMatch[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div key={index} className="flex items-start gap-2 ml-2 mb-1">
             <div className="min-w-[6px] w-[6px] h-[6px] bg-current rounded-full mt-2 opacity-60"></div>
             <span dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        );
      }

      // Handle normal lines with bold
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle empty lines as breaks
      if (!line.trim()) return <div key={index} className="h-2"></div>;

      return <div key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none font-['Nunito']">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-md w-[90vw] md:w-96 h-[550px] max-h-[80vh] rounded-[2rem] shadow-2xl shadow-rose-200/50 border-4 border-white mb-4 pointer-events-auto flex flex-col overflow-hidden animate-fade-in-up origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-5 flex justify-between items-center text-white shrink-0">
             <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-xl text-rose-500 shadow-sm">
                     <Flower size={20} strokeWidth={3} />
                 </div>
                 <div>
                     <h3 className="font-black text-lg leading-tight">SheThrive AI</h3>
                     <div className="flex items-center gap-1.5 text-xs font-bold opacity-90 bg-white/20 px-2 py-0.5 rounded-full w-fit mt-1">
                         <span className="w-2 h-2 bg-green-400 rounded-full border border-white"></span> Online
                     </div>
                 </div>
             </div>
             <div className="flex gap-2">
                 <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                     <Minimize2 size={20} />
                 </button>
             </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFF0F5]">
             {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-bold leading-relaxed shadow-sm ${
                         msg.role === 'user' 
                           ? 'bg-rose-500 text-white rounded-br-none' 
                           : 'bg-white text-slate-700 rounded-bl-none border border-white'
                     }`}>
                         {msg.role === 'user' ? msg.text : formatMessageText(msg.text)}
                     </div>
                 </div>
             ))}
             {isLoading && (
                 <div className="flex justify-start">
                     <div className="bg-white p-4 rounded-3xl rounded-bl-none shadow-sm flex items-center gap-3">
                         <Loader2 size={18} className="animate-spin text-rose-400" />
                         <span className="text-xs font-bold text-slate-400">Thinking...</span>
                     </div>
                 </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-50 shrink-0">
             <div className="relative flex items-center">
                 <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="w-full pl-5 pr-14 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-rose-300 focus:bg-white outline-none text-sm font-bold text-slate-900 resize-none transition-all placeholder:text-slate-400"
                    rows={1}
                    style={{ minHeight: '56px' }}
                 />
                 <button 
                   onClick={handleSend}
                   disabled={!input.trim() || isLoading}
                   className="absolute right-2 p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:opacity-50 disabled:hover:bg-rose-500 transition-all shadow-md shadow-rose-200"
                 >
                     <Send size={18} strokeWidth={2.5} />
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto p-5 rounded-[2rem] shadow-xl shadow-rose-300/50 transition-all duration-300 transform hover:scale-105 border-4 border-white ${
            isOpen ? 'bg-slate-800 rotate-90 text-slate-400' : 'bg-gradient-to-br from-rose-400 to-pink-500 text-white'
        }`}
      >
        {isOpen ? <X size={28} strokeWidth={3} /> : <MessageCircle size={32} strokeWidth={2.5} />}
      </button>

    </div>
  );
};

export default GlobalAiChat;
