import React, { useState, useEffect } from 'react';
import { Wind, ChevronLeft, Play, Pause, RotateCcw } from 'lucide-react';

const BreathingSession = ({ onBack }) => {
  const [phase, setPhase] = useState('inhale');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 1) {
            // Transition to next phase
            if (phase === 'inhale') {
              setPhase('hold-in');
              return 4;
            } else if (phase === 'hold-in') {
              setPhase('exhale');
              return 4;
            } else if (phase === 'exhale') {
              setPhase('hold-out');
              return 4;
            } else {
              setPhase('inhale');
              setCycles(c => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  const phases = {
    'inhale': { label: 'Inhale', color: 'text-blue-400', bg: 'bg-blue-500/20', scale: 'scale-150' },
    'hold-in': { label: 'Hold', color: 'text-indigo-400', bg: 'bg-indigo-500/20', scale: 'scale-150' },
    'exhale': { label: 'Exhale', color: 'text-emerald-400', bg: 'bg-emerald-500/20', scale: 'scale-100' },
    'hold-out': { label: 'Rest', color: 'text-muted', bg: 'bg-gray-500/10', scale: 'scale-100' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black tracking-widest uppercase">Back to Control</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-glass border border-borderglass rounded-xl">
            <span className="text-muted text-[10px] font-black tracking-widest uppercase mr-2">Cycles:</span>
            <span className="text-foreground font-bold">{cycles}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-16 py-12">
        <div className="relative flex items-center justify-center">
          {/* Animated Rings */}
          <div className={`absolute w-64 h-64 rounded-full blur-3xl transition-all duration-[4000ms] ease-in-out ${phases[phase].bg} ${isActive ? phases[phase].scale : 'scale-75'}`}></div>
          <div className={`absolute w-80 h-80 border border-borderglass rounded-full transition-all duration-[4000ms] ease-in-out ${isActive ? phases[phase].scale : 'scale-75'}`}></div>
          
          {/* Main Circle */}
          <div className={`w-48 h-48 rounded-full border-2 border-borderglass flex items-center justify-center bg-[#000]/40 backdrop-blur-xl z-10 transition-all duration-[4000ms] ease-in-out ${isActive ? phases[phase].scale : 'scale-90'}`}>
            <div className="text-center">
              <h2 className={`text-2xl font-black tracking-tighter uppercase mb-1 ${phases[phase].color}`}>{phases[phase].label}</h2>
              <p className="text-4xl font-black text-foreground">{seconds}</p>
            </div>
          </div>

          <Wind className={`absolute -top-6 -right-6 w-8 h-8 text-indigo-500/50 ${isActive ? 'animate-bounce' : ''}`} />
        </div>

        <div className="text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Box Breathing</h1>
            <p className="text-muted text-sm font-medium max-w-sm mx-auto">
              A powerful technique to calm the nervous system and regain focus. 4s Inhale, 4s Hold, 4s Exhale, 4s Rest.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setIsActive(false);
                setPhase('inhale');
                setSeconds(4);
                setCycles(0);
              }}
              className="p-4 bg-glass border border-borderglass rounded-2xl text-muted hover:text-foreground hover:border-white/20 transition-all"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-glass brightness-110 text-foreground border border-white/20' 
                  : 'bg-indigo-600 text-foreground shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:bg-indigo-500'
              }`}
            >
              {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingSession;
