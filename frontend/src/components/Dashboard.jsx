import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Brain, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  Heart, 
  Zap, 
  Smile, 
  Frown,
  Star,
  Bell,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { analyticsAPI } from '../utils/api';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';

import { notificationSystem } from '../utils/notifications';
import CalendarInsights from './CalendarInsights';

const Dashboard = ({ onNavigate, currentMood }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');

  // Load initial data
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await analyticsAPI.getDashboard();
        setAnalytics(res.data);
        if (res.data?.history) {
          setSessionHistory(res.data.history.slice(-10));
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Update session history in real-time when currentMood changes
  useEffect(() => {
    if (currentMood && currentMood.emotion !== 'Neutral') {
      const newPoint = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        score: Math.round(currentMood.intensity * 100),
        emotion: currentMood.emotion
      };
      setSessionHistory(prev => [...prev.slice(-19), newPoint]);
    }
  }, [currentMood]);

  // Derived Real-time Stability Index
  const stabilityIndex = useMemo(() => {
    if (sessionHistory.length === 0) return analytics?.wellness_index || 75;
    const sum = sessionHistory.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / sessionHistory.length);
  }, [sessionHistory, analytics]);

  // Derived Real-time Spectral Distribution
  const spectralData = useMemo(() => {
    const base = { 'Joy': 20, 'Surprise': 10, 'Neutral': 40, 'Sadness': 10, 'Anger': 10, 'Fear': 10 };
    if (sessionHistory.length === 0) return analytics?.distribution || Object.entries(base).map(([k, v]) => ({ emotion: k, percentage: v }));
    
    const counts = sessionHistory.reduce((acc, curr) => {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(base).map(([emotion, val]) => ({
      emotion,
      percentage: counts[emotion] ? (counts[emotion] / sessionHistory.length) * 100 : val / 2
    }));
  }, [sessionHistory, analytics]);

  // Protocols based on current mood
  const activeProtocols = useMemo(() => {
    const emotion = currentMood?.emotion?.toLowerCase();
    if (emotion === 'joy') return ['Creative Flow', 'Gratitude Journal', 'Peak Performance'];
    if (emotion === 'sadness' || emotion === 'sad') return ['Joy Recovery', 'Light Therapy', 'Connect with Friends'];
    if (emotion === 'anger') return ['Box Breathing', 'Physical Release', 'Cool Down'];
    if (emotion === 'fear' || emotion === 'anxiety') return ['Grounding 5-4-3-2-1', 'Calm Soundscape', 'Safety Check'];
    return ['Focus Session', 'Daily Review', 'Meditation'];
  }, [currentMood]);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await analyticsAPI.getDashboard();
      setAnalytics(res.data);
    } catch (e) {}
    setTimeout(() => setSyncing(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
        </div>
        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gray-500">Initializing System...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Live Monitoring: Active</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none mb-2">My Overview</h1>
          <p className="text-gray-500 text-sm font-medium">Track your emotional well-being and daily insights in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`p-3 border rounded-2xl transition-all ${
              notificationsEnabled ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
            }`}
          >
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={handleManualSync}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* BENTO GRID - MAIN LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Real-time Mood Resonance - HIGHLIGHT */}
        <div className="bento-card bg-gradient-to-br from-indigo-600/20 via-transparent to-emerald-600/10 border-indigo-500/30 lg:col-span-1 flex flex-col justify-between p-8">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Current Mood</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-indigo-400 uppercase">Live</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Mood State</p>
              <h3 className="text-4xl font-black text-white tracking-tighter transition-all duration-500">{currentMood?.emotion || 'Calibrating'}</h3>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Intensity</span>
              <span className="text-xl font-black text-white tabular-nums">{Math.round((currentMood?.intensity || 0) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                style={{ width: `${Math.max(5, (currentMood?.intensity || 0) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-tighter">
              Last Frame: {currentMood?.timestamp?.toLocaleTimeString() || 'Waiting for stream...'}
            </p>
          </div>
        </div>

        {/* AI Insight Synthesis - WIDE */}
        <div className="lg:col-span-3 obsidian-card bg-[#050505] border-white/5 hover:border-white/10 transition-colors">
          <div className="flex flex-col md:flex-row h-full gap-8">
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  </div>
                  <span className="text-emerald-400 text-[10px] font-black tracking-widest uppercase">Daily Summary</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 leading-tight text-white/90">
                  {stabilityIndex >= 70 
                    ? "Your emotional patterns show exceptional clarity today." 
                    : "Slight emotional turbulence detected. Consider a mindfulness exercise."}
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed font-medium">
                  {analytics?.insight || "We've analyzed your recent biometric data. You're showing high adaptability in your emotional core."}
                </p>
              </div>
              
              <div className="mt-8 flex items-center gap-4">
                <button 
                  onClick={() => onNavigate('practice')}
                  className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  Start Practice
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Next Update: 22m</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col gap-3">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Live Protocols</p>
              {activeProtocols.map((p, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer">
                  <span className="text-xs font-bold text-gray-300">{p}</span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stability Index Chart */}
        <div className="bento-card lg:col-span-1 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Mood Stability</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-7xl font-black tracking-tighter text-white">{stabilityIndex}</span>
              <span className="text-2xl text-gray-700 font-bold">%</span>
            </div>
          </div>
          <div className="h-24 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionHistory.length > 0 ? sessionHistory : analytics?.history || []}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Spectral Radar */}
        <div className="bento-card lg:col-span-1 min-h-[300px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-4 h-4 text-purple-500" />
            <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Emotion Breakdown</span>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={spectralData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="emotion" tick={{ fill: '#555', fontSize: 9, fontWeight: 800 }} />
                <Radar
                  name="Intensity"
                  dataKey="percentage"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Optimization Protocols - NEW LIST */}
        <div className="bento-card lg:col-span-2 border-emerald-500/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Recommended for You</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group">
                <Smile className="w-6 h-6 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-bold text-white mb-1">Joy Boost</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Protocol Delta</p>
              </div>
              <div className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group">
                <Zap className="w-6 h-6 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-bold text-white mb-1">Neural Reset</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Immediate Effect</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate('breathing')}
            className="w-full mt-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
          >
            Trigger Global Recalibration
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="pt-10 border-t border-white/5">
        <CalendarInsights history={analytics?.history} />
      </div>
    </div>
  );
};

export default Dashboard;
