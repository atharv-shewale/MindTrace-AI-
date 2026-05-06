import React, { useState, useEffect } from 'react';
import { X, Play, Volume2, Sparkles, Laugh } from 'lucide-react';

const FUNNY_VIDEOS = [
  "https://www.youtube.com/embed/989-7LBIn_Y?autoplay=1", // Funny animals
  "https://www.youtube.com/embed/5_sfnQDr1-o?autoplay=1", // Cute puppies
  "https://www.youtube.com/embed/3dcli9i_pvA?autoplay=1", // Funny cats
  "https://www.youtube.com/embed/nGeKSiCQkPw?autoplay=1", // Relaxing nature
  "https://www.youtube.com/embed/hY7m5jjJ9mM?autoplay=1", // Funny baby laughs
  "https://www.youtube.com/embed/FzRH3iTQPrk?autoplay=1", // Animal bloopers
  "https://www.youtube.com/embed/mX2AyjVrrck?autoplay=1"  // Satisfaction video
];

const FunnyVideoIntervention = ({ isOpen, onClose, emotion }) => {
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      const randomVideo = FUNNY_VIDEOS[Math.floor(Math.random() * FUNNY_VIDEOS.length)];
      setVideoUrl(randomVideo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Laugh className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Mood Uplift Protocol</h3>
              <p className="text-[10px] font-black text-amber-500/80 tracking-tighter uppercase">Detected: Sustained {emotion || 'Intensity'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Frame */}
        <div className="aspect-video w-full bg-black">
          <iframe
            src={videoUrl}
            title="MindTrace Uplift"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>

        {/* Footer Info */}
        <div className="p-8 bg-[#0a0a0a] border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Recommendation</span>
              </div>
              <h4 className="text-xl font-bold text-white">A quick break to reset your neural state.</h4>
              <p className="text-gray-500 text-sm max-w-md">Our sensors detected a sustained negative loop. Laughter is the fastest way to break cortical tension.</p>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-gray-200 transition-all shadow-xl"
            >
              Back to Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnyVideoIntervention;
