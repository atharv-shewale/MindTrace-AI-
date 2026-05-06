import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Brain, Shield, Zap } from 'lucide-react';
import { emotionAPI } from '../utils/api';

const FaceEmotionTracker = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;
    if (isActive) {
      startCamera();
      interval = setInterval(captureAndAnalyze, 5000); // Analyze every 5 seconds
    } else {
      stopCamera();
    }
    return () => {
      clearInterval(interval);
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please enable it for live tracking.");
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.6);
    
    setLoading(true);
    try {
      const res = await emotionAPI.detectFace(base64Image);
      setEmotion(res.data);
      onEmotionDetected?.(res.data);
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="obsidian-card p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-800 text-slate-500'}`}>
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Tracking</h3>
            <p className="text-[10px] font-black text-slate-500 tracking-tighter uppercase">Real-time Expression Analysis</p>
          </div>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${
            isActive 
              ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20' 
              : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-105'
          }`}
        >
          {isActive ? 'Disconnect' : 'Connect Vision'}
        </button>
      </div>

      <div className="relative aspect-video rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden group">
        {!isActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <CameraOff className="w-10 h-10 text-slate-800 mb-3" />
            <p className="text-xs text-slate-600 font-bold max-w-[180px]">Connect your tracking link for live emotional feedback</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* HUD Overlay */}
            <div className="absolute inset-0 border-[20px] border-transparent pointer-events-none">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500/40"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500/40"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500/40"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500/40"></div>
            </div>

            {loading && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black tracking-widest text-white uppercase">Syncing...</span>
              </div>
            )}
          </>
        )}
      </div>

      {emotion && isActive && (
        <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detected State</span>
            </div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{Math.round(emotion.dominant_intensity * 100)}% Match</span>
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-black text-white uppercase">{emotion.dominant_emotion}</h4>
            <div className={`p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-[10px] text-red-400 font-bold text-center italic">{error}</p>
      )}
      
      <div className="mt-4 flex items-center gap-4 text-[8px] font-black tracking-[0.2em] text-slate-600 uppercase">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
          End-to-End Encrypted
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
          Local Frame Capture
        </div>
      </div>
    </div>
  );
};

export default FaceEmotionTracker;
