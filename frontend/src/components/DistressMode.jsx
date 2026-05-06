import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, X, Wind, Heart, Shield, Activity } from 'lucide-react';

const DistressMode = ({ isActive, emotion, intensity, onClose, sosContacts = [] }) => {
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isActive) return;

    let timer;
    const runBreathing = () => {
      setBreathingPhase('inhale');
      setScale(1.5);
      
      timer = setTimeout(() => {
        setBreathingPhase('hold');
        timer = setTimeout(() => {
          setBreathingPhase('exhale');
          setScale(1);
          timer = setTimeout(() => {
            setBreathingPhase('rest');
            timer = setTimeout(runBreathing, 2000);
          }, 4000);
        }, 4000);
      }, 4000);
    };

    runBreathing();
    return () => clearTimeout(timer);
  }, [isActive]);

  if (!isActive) return null;

  const groundingTips = [
    { label: 'SIGHT', text: 'Find 5 things you can see' },
    { label: 'TOUCH', text: 'Find 4 things you can feel' },
    { label: 'SOUND', text: 'Find 3 things you can hear' },
    { label: 'SMELL', text: 'Find 2 things you can smell' },
    { label: 'TASTE', text: 'Find 1 thing you can taste' },
  ];

  const breathingLabels = {
    inhale: 'Expanding...',
    hold: 'Hold Still',
    exhale: 'Releasing...',
    rest: 'Prepare'
  };

  return (
    <div className="fixed inset-0 bg-[#000]/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-6 selection:bg-red-500/30">
      <div className="w-full max-w-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="obsidian-card !p-0 border-red-500/20 shadow-[0_0_100px_rgba(239,68,68,0.15)] overflow-hidden">
          {/* Header Banner */}
          <div className="p-8 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/20">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Neural Override Active</h1>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  <p className="text-[10px] font-black tracking-[0.2em] text-red-400 uppercase">Emergency Protocol Engaged</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Col: Breathing */}
            <div className="flex flex-col items-center justify-center space-y-8 py-4">
              <div className="relative flex items-center justify-center">
                {/* Breathing Orbs */}
                <div 
                  className="absolute w-40 h-40 bg-red-500/20 rounded-full blur-3xl transition-transform duration-[4000ms] ease-in-out"
                  style={{ transform: `scale(${scale * 1.5})` }}
                ></div>
                <div 
                  className="w-32 h-32 border-2 border-red-500/30 rounded-full flex items-center justify-center transition-transform duration-[4000ms] ease-in-out"
                  style={{ transform: `scale(${scale})` }}
                >
                  <div className="text-center">
                    <p className="text-[10px] font-black tracking-widest text-red-500 uppercase mb-1">Phase</p>
                    <p className="text-xs font-bold text-white uppercase">{breathingLabels[breathingPhase]}</p>
                  </div>
                </div>
                <Wind className="absolute -top-4 -right-4 w-6 h-6 text-red-500/50 animate-bounce" />
              </div>
              
              <div className="text-center">
                <h3 className="text-sm font-black tracking-widest uppercase text-gray-500 mb-2">Neural Pacing</h3>
                <p className="text-xs text-gray-400 font-medium max-w-[200px]">Focus solely on the expansion and contraction of the circle.</p>
              </div>
            </div>

            {/* Right Col: Grounding & SOS */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase flex items-center gap-2">
                  <Activity className="w-3 h-3 text-red-500" />
                  Grounding Sequence
                </h3>
                <div className="space-y-2">
                  {groundingTips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-2xl group hover:border-red-500/30 transition-all">
                      <span className="text-[10px] font-black text-red-500/50 w-10">{tip.label}</span>
                      <p className="text-xs font-bold text-gray-300">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {sosContacts.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase flex items-center gap-2">
                    <Phone className="w-3 h-3 text-red-500" />
                    Neural Safety Line
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {sosContacts.map((contact, i) => (
                      <a
                        key={i}
                        href={`tel:${contact.phone}`}
                        className="flex items-center justify-between p-4 bg-red-600/10 border border-red-600/20 rounded-2xl hover:bg-red-600/20 transition-all"
                      >
                        <div>
                          <p className="text-xs font-black text-white uppercase">{contact.name}</p>
                          <p className="text-[10px] font-bold text-red-400">{contact.phone}</p>
                        </div>
                        <Phone className="w-4 h-4 text-red-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-white/5 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-[#111] border border-[#222] rounded-2xl text-xs font-black tracking-widest uppercase text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              Stability Restored
            </button>
            <button className="flex-1 py-4 bg-red-600 rounded-2xl text-xs font-black tracking-widest uppercase text-white shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all active:scale-[0.98]">
              Request Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistressMode;

