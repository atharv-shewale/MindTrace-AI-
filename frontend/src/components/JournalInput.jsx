import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, Sparkles, Brain, Zap, Heart, Mic, MicOff } from 'lucide-react';
import { journalAPI, emotionAPI } from '../utils/api';

const JournalInput = ({ onEmotionDetected, onJournalCreated, onDistressAlert, onNavigate }) => {
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const debounceTimerRef = useRef(null);
  
  // Session Tracking State
  const [sessionMoods, setSessionMoods] = useState([]);
  const [sessionStartTime] = useState(Date.now());
  const [audioSentiment, setAudioSentiment] = useState(0.6); // Default neutral baseline

  const moods = [
    { value: 0.2, label: 'Low', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 0.4, label: 'Tired', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 0.6, label: 'Neutral', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 0.8, label: 'Good', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 1.0, label: 'Elite', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Listen to real-time background mood updates for Video Score
    const handleMoodUpdate = (e) => {
      const { intensity, emotion } = e.detail;
      const negativeList = ['Sadness', 'Sad', 'Anger', 'Fear', 'Frustration', 'Anxiety', 'Depressed'];
      const score = negativeList.includes(emotion) ? (1.0 - intensity) : intensity;
      setSessionMoods(prev => [...prev, score]);
    };

    window.addEventListener('mood-update', handleMoodUpdate);
    return () => {
      window.removeEventListener('mood-update', handleMoodUpdate);
      recognitionRef.current?.stop();
    };
  }, []);

  // Audio Analysis Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioDataRef = useRef([]);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const timeData = new Uint8Array(bufferLength);
      const freqData = new Uint8Array(bufferLength);
      
      const analyze = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(timeData);
        analyserRef.current.getByteFrequencyData(freqData);
        
        // 1. RMS (Volume/Energy)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = (timeData[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / bufferLength);
        
        // 2. Frequency Variance (Pitch Stability)
        let freqSum = 0;
        for (let i = 0; i < bufferLength; i++) freqSum += freqData[i];
        const avgFreq = freqSum / bufferLength;
        
        let variance = 0;
        for (let i = 0; i < bufferLength; i++) variance += Math.pow(freqData[i] - avgFreq, 2);
        const pitchJitter = Math.sqrt(variance / bufferLength) / 128;

        // Biological Fusion Score: Calmness = High stability (low jitter) + Moderate volume
        const stabilityScore = Math.max(0, 1 - pitchJitter);
        const energyScore = Math.max(0, 1 - (rms * 4));
        
        const finalAudioScore = (stabilityScore * 0.4) + (energyScore * 0.6);
        audioDataRef.current.push(finalAudioScore);
        
        if (audioContextRef.current.state !== 'closed') {
          requestAnimationFrame(analyze);
        }
      };
      
      analyze();
    } catch (err) {
      console.error("Audio analysis failed:", err);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        analyserRef.current = null;
      }
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      startAudioAnalysis();
    }
  };

  // Real-time Debounced Analysis
  useEffect(() => {
    if (!text.trim() || text.length < 5) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleAnalyze();
    }, 1500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [text]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await emotionAPI.detect(text);
      const result = res.data;
      setAnalysis(result);
      onEmotionDetected?.(result);

      if (result.dominant_intensity >= 0.85 || (result.escalation_score && result.escalation_score >= 0.85)) {
        onDistressAlert?.({
          emotion: result.dominant_emotion,
          intensity: result.dominant_intensity,
          escalation_score: result.escalation_score || result.dominant_intensity,
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const [lastSynced, setLastSynced] = useState(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      // Calculate Video Score (average of all captured frames during the session)
      const videoScore = sessionMoods.length > 0 
        ? sessionMoods.reduce((a, b) => a + b, 0) / sessionMoods.length 
        : 0.6;

      // Calculate Audio Score (average of vocal energy)
      const audioScore = audioDataRef.current.length > 0
        ? audioDataRef.current.reduce((a, b) => a + b, 0) / audioDataRef.current.length
        : 0.6;

      const res = await journalAPI.create({
        content: text,
        mood_intensity: selectedMood || 0.6,
        audio_score: audioScore,
        video_score: videoScore
      });
      setText('');
      setSelectedMood(null);
      setAnalysis(null);
      setLastSynced(res.data);
      onJournalCreated?.();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (lastSynced) setLastSynced(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-muted text-sm font-bold tracking-widest uppercase mb-1">Journaling</h2>
          <h1 className="text-4xl font-black tracking-tight">Daily Journal</h1>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all duration-500 ${loading ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${loading ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-emerald-500'}`}></div>
          <span className={`text-[10px] font-black tracking-widest uppercase ${loading ? 'text-indigo-500' : 'text-emerald-500'}`}>
            {loading ? 'Analyzing Mood...' : 'Save Entry'}
          </span>
        </div>
      </div>

      <div className="obsidian-card group">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="How was your day? Write your thoughts here..."
          className="w-full bg-transparent text-xl font-medium text-foreground placeholder:text-gray-700 border-none focus:ring-0 resize-none h-64 transition-all"
        />

        {/* Success Message */}
        {lastSynced && (
          <div className="absolute top-10 right-10 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in zoom-in duration-300">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500 text-[10px] font-black tracking-widest uppercase">Entry Saved Successfully</span>
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-black tracking-widest text-muted uppercase">How do you feel?</p>
            <div className="flex gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all ${
                    selectedMood === mood.value
                      ? `${mood.color} scale-105 shadow-lg`
                      : 'border-borderglass text-gray-600 hover:text-muted hover:bg-glass'
                  }`}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${
                isListening 
                  ? 'bg-red-500 text-foreground animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-[#1a1a1a] border border-[#333] text-muted hover:text-foreground'
              }`}
              title={isListening ? 'Stop Listening' : 'Start Voice-to-Text'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || saving}
              className="px-8 py-3 bg-indigo-600 rounded-2xl text-xs font-black tracking-widest uppercase text-foreground shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Save Entry
            </button>
          </div>
        </div>
      </div>

      {lastSynced && !analysis && (
        <div className="bento-card border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-emerald-500" />
            <span className="text-muted text-[10px] font-black tracking-widest uppercase">Latest Archive</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black mb-1 capitalize">Primary Emotion: {lastSynced.dominant_emotion}</h3>
              <p className="text-muted text-xs font-bold tracking-widest uppercase italic">The cloud has assimilated your state.</p>
            </div>
            <div className="flex gap-3">
              {['sadness', 'anger', 'fear', 'anxiety'].includes(lastSynced.dominant_emotion?.toLowerCase()) && (
                <button 
                  onClick={() => onNavigate('companion')}
                  className="px-4 py-2 bg-indigo-600 rounded-xl text-[10px] font-black tracking-widest uppercase text-foreground hover:bg-indigo-500 transition-all shadow-lg"
                >
                  Talk to Companion
                </button>
              )}
              <div className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
                Synced
              </div>
            </div>
          </div>
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-muted text-[10px] font-black tracking-widest uppercase">Detection Result</span>
            </div>
            <h3 className="text-2xl font-black mb-1 capitalize">{analysis.dominant_emotion}</h3>
            <p className="text-muted text-xs font-bold tracking-widest uppercase mb-4">Dominant Signal</p>
            <div className="h-2 w-full bg-glass rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${analysis.dominant_intensity * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bento-card">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-muted text-[10px] font-black tracking-widest uppercase">AI Suggestions</span>
            </div>
            <div className="space-y-4">
              {analysis.suggestions?.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-glass rounded-2xl border border-borderglass group-hover:border-emerald-500/20 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                  <p className="text-gray-300 text-xs font-medium leading-relaxed">{suggestion}</p>
                </div>
              ))}
              {!analysis.suggestions?.length && (
                <p className="text-muted text-sm font-medium leading-relaxed italic">
                  {analysis.insight || "Processing insights for your wellness..."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalInput;

