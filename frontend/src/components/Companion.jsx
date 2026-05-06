import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, Sparkles, Brain, Shield, User, MessageCircle } from 'lucide-react';
import apiClient from '../utils/api';

const Companion = ({ currentEmotionData }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: "Hello... I'm your MindTrace Companion. I'm here to listen, to understand, and to walk with you through whatever you're feeling right now. How are you doing?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const response = await apiClient.post('/api/companion/chat', { message: userMessage });
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: response.data.response, 
        emotion: response.data.detected_emotion,
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error('Companion Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm sorry, I'm having a little trouble with our connection. I'm still here for you, though.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header: Live Resonance Context */}
      <div className="obsidian-card !p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
              <Heart className={`w-6 h-6 text-indigo-400 ${currentEmotionData?.intensity > 0.6 ? 'animate-pulse' : ''}`} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white">MindTrace Companion</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Live Resonance:</span>
              <span className={`text-[10px] font-black tracking-widest uppercase ${
                currentEmotionData?.emotion === 'Joy' ? 'text-emerald-400' : 
                currentEmotionData?.emotion === 'Sadness' ? 'text-indigo-400' : 'text-gray-400'
              }`}>
                {currentEmotionData?.emotion || 'Calibrating...'}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Empathetic Support: Active</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 obsidian-card !p-0 overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border ${
                  msg.role === 'user' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div className={`space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-[22px] text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-white/5 border border-white/10 text-gray-200'
                  }`}>
                    {msg.content}
                  </div>
                  <div className="px-2 flex items-center gap-2">
                    <span className="text-[8px] font-black tracking-widest text-gray-600 uppercase">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.emotion && (
                      <span className="text-[8px] font-black tracking-widest text-indigo-500 uppercase italic">
                        • Sensed {msg.emotion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Speak your truth..."
              className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl pl-6 pr-16 py-5 text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Companion;
