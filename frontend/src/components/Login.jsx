import React, { useState } from 'react';
import { LogIn, Brain, Eye, EyeOff, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Account credentials required.');
      return;
    }

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Password match failed. Confirmation must match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        const { access_token, user } = response.data;
        login(user, access_token);
        onLoginSuccess?.(user, access_token);
      } else {
        const response = await authAPI.signup({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          name: formData.fullName,
          username: formData.email.split('@')[0],
        });
        const { access_token, user } = response.data;
        login(user, access_token);
        onLoginSuccess?.(user, access_token);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Authentication connection failed. Please check your internet connection.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-indigo-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-[22px] shadow-[0_0_30px_rgba(99,102,241,0.4)] mb-6 group transition-transform duration-500 hover:rotate-12">
            <Brain className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-2">
            MINDTRACE<span className="text-indigo-500">AI+</span>
          </h1>
          <p className="text-muted font-medium tracking-wide">Secure Personal Insights</p>
        </div>

        {/* Main Card */}
        <div className="obsidian-card !p-0">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-glass border-b border-borderglass">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-4 text-xs font-black tracking-[0.2em] uppercase transition-all rounded-t-[28px] ${
                mode === 'login' ? 'text-foreground bg-glass' : 'text-muted hover:text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-4 text-xs font-black tracking-[0.2em] uppercase transition-all rounded-t-[28px] ${
                mode === 'signup' ? 'text-foreground bg-glass' : 'text-muted hover:text-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-muted uppercase ml-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full bg-[#111] border border-[#222] rounded-2xl px-5 py-4 text-foreground placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest text-muted uppercase ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full bg-[#111] border border-[#222] rounded-2xl px-5 py-4 text-foreground placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest text-muted uppercase ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-[#222] rounded-2xl px-5 py-4 text-foreground placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-muted"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-muted uppercase ml-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-[#222] rounded-2xl px-5 py-4 text-foreground placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                <Shield className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs font-bold text-red-500">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-foreground font-black tracking-widest uppercase text-xs py-5 rounded-2xl shadow-[0_10px_20px_rgba(99,102,241,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-3">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer Info */}
          <div className="px-8 pb-8 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <p className="text-[9px] font-black tracking-[0.2em] text-gray-600 uppercase">
              End-to-End Data Encryption Active
            </p>
          </div>
        </div>

        {/* System Credentials Hint */}
        <div className="mt-8 text-center">
          <p className="text-gray-700 text-[10px] font-bold tracking-widest uppercase">
            Test Access: <span className="text-muted">demo@mindtrace.com</span> / <span className="text-muted">DemoPass123!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

