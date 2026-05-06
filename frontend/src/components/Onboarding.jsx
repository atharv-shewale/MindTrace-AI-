import React, { useState } from 'react';
import { Shield, Heart, User, Mail, Compass, ArrowRight, Brain } from 'lucide-react';
import { userAPI } from '../utils/api';

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    guardian_email: '',
    age: '',
    gender: '',
    interests: [],
    report_frequency: 'daily',
    report_enabled: true,
  });
  const [loading, setLoading] = useState(false);

  const availableInterests = [
    "Mindfulness", "Coding", "Music", "Fitness", 
    "Art", "Science", "Nature", "Gaming"
  ];

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await userAPI.updateProfile(formData);
      onComplete();
    } catch (err) {
      console.error('Onboarding update failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#000000] overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-xl relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-[22px] mb-6">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Getting Started</h1>
          <p className="text-gray-500 font-medium">Step {step} of 4: Personalizing your experience</p>
        </div>

        <div className="obsidian-card !p-10">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <Shield className="w-6 h-6 text-indigo-500 shrink-0" />
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest leading-relaxed">
                  Safety Protocol: We need a guardian email to notify in case of critical mood changes.
                </p>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1">Guardian Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                  <input
                    type="email"
                    value={formData.guardian_email}
                    onChange={(e) => setFormData({...formData, guardian_email: e.target.value})}
                    placeholder="guardian@example.com"
                    className="w-full bg-[#111] border border-[#222] rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.guardian_email}
                className="w-full py-5 bg-indigo-600 rounded-2xl text-xs font-black tracking-widest uppercase text-white hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1">Age</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.age}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, age: val});
                    }}
                    placeholder="25"
                    className="w-full bg-[#111] border border-[#222] rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-[#111] border border-[#222] rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-5 bg-[#111] border border-[#222] rounded-2xl text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-white transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.age || !formData.gender}
                  className="flex-[2] py-5 bg-indigo-600 rounded-2xl text-[10px] font-black tracking-widest uppercase text-white hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  Configure Interests <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1">Select Core Interests</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`py-3 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all ${
                        formData.interests.includes(interest)
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                          : 'bg-[#111] border-[#222] text-gray-500 hover:border-gray-700'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-5 bg-[#111] border border-[#222] rounded-2xl text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-white transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={formData.interests.length === 0}
                  className="flex-[2] py-5 bg-indigo-600 rounded-2xl text-[10px] font-black tracking-widest uppercase text-white hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  Report Settings <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Enable Synthesis Reports</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Receive deep neural analysis via email</p>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, report_enabled: !formData.report_enabled})}
                    className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${formData.report_enabled ? 'bg-emerald-500' : 'bg-[#222]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.report_enabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1">Report Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['daily', 'weekly', 'monthly'].map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setFormData({...formData, report_frequency: freq})}
                        className={`py-4 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all ${
                          formData.report_frequency === freq
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                            : 'bg-[#111] border-[#222] text-gray-500 hover:border-gray-700'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-5 bg-[#111] border border-[#222] rounded-2xl text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-white transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] py-5 bg-emerald-600 rounded-2xl text-[10px] font-black tracking-widest uppercase text-white hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? 'Finalizing Sync...' : 'Complete Initialization'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
