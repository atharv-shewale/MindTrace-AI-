import React, { useState, useEffect } from 'react';
import { User, Settings as SettingsIcon, LogOut, Plus, Trash2, Shield, Bell, Globe, Activity, Brain, Mail } from 'lucide-react';
import apiClient, { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Settings = ({ user, onLogout }) => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(user || {});
  const [sosContacts, setSosContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [formChanged, setFormChanged] = useState(false);

  useEffect(() => {
    loadProfile();
    loadSosContacts();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadSosContacts = async () => {
    try {
      const response = await apiClient.get('/api/sos/contacts');
      setSosContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error loading SOS contacts:', error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    // Filter only relevant fields for UserProfileUpdate
    const updateData = {
      full_name: profile.full_name || profile.name,
      age: profile.age,
      timezone: profile.timezone,
      gender: profile.gender,
      occupation: profile.occupation,
      bio: profile.bio,
      notification_enabled: profile.notification_enabled,
      public_profile: profile.public_profile,
      background_tracking_enabled: profile.background_tracking_enabled,
      report_enabled: profile.report_enabled,
      report_frequency: profile.report_frequency,
      interests: profile.interests
    };

    try {
      const response = await userAPI.updateProfile(updateData);
      setProfile(response.data);
      updateUser(response.data);
      setFormChanged(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    try {
      await apiClient.post('/api/sos/contacts', newContact);
      setNewContact({ name: '', phone: '', relationship: '' });
      loadSosContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await apiClient.delete(`/api/sos/contacts/${contactId}`);
      loadSosContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleProfileChange = async (field, value, immediate = false) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    setFormChanged(true);
    
    if (immediate) {
      try {
        const updateData = {
          full_name: updatedProfile.full_name || updatedProfile.name,
          age: updatedProfile.age,
          timezone: updatedProfile.timezone,
          gender: updatedProfile.gender,
          occupation: updatedProfile.occupation,
          bio: updatedProfile.bio,
          notification_enabled: updatedProfile.notification_enabled,
          public_profile: updatedProfile.public_profile,
          background_tracking_enabled: updatedProfile.background_tracking_enabled,
          interests: updatedProfile.interests
        };
        const response = await userAPI.updateProfile(updateData);
        updateUser(response.data);
        setFormChanged(false);
      } catch (error) {
        console.error('Error auto-saving setting:', error);
        // Revert on failure
        setProfile(profile);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-1">Configuration</h2>
          <h1 className="text-4xl font-black tracking-tight">Application Settings</h1>
        </div>
        <button
          onClick={onLogout}
          className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black tracking-widest uppercase hover:bg-red-500/20 transition-all flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          Terminate Session
        </button>
      </div>

      <div className="flex gap-4 p-1 bg-[#111] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
            activeTab === 'profile' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Identity
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
            activeTab === 'emergency' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Privacy Guard
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="obsidian-card">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-indigo-500 uppercase mb-8 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Profile Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-gray-600 uppercase ml-1">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name || profile.name || ''}
                  onChange={(e) => handleProfileChange('full_name', e.target.value)}
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-5 py-4 text-white focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-gray-600 uppercase ml-1">Age</label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => handleProfileChange('age', parseInt(e.target.value))}
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-5 py-4 text-white focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-gray-600 uppercase ml-1">Timezone</label>
                <select
                  value={profile.timezone || 'UTC'}
                  onChange={(e) => handleProfileChange('timezone', e.target.value)}
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-5 py-4 text-white focus:border-indigo-500/50 transition-all appearance-none"
                >
                  <option value="UTC">UTC</option>
                  <option value="IST">IST (+5:30)</option>
                  <option value="EST">EST (-5:00)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest text-gray-600 uppercase ml-1">Role/Occupation</label>
                <input
                  type="text"
                  value={profile.occupation || ''}
                  onChange={(e) => handleProfileChange('occupation', e.target.value)}
                  className="w-full bg-[#050505] border border-[#1a1a1a] rounded-2xl px-5 py-4 text-white focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#1a1a1a] flex justify-end">
              <button
                onClick={handleProfileUpdate}
                disabled={!formChanged || loading}
                className="px-8 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black tracking-widest uppercase text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Save Profile'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bento-card">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Alerts</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Smart Notifications</p>
                <div 
                  onClick={() => handleProfileChange('notification_enabled', !profile.notification_enabled, true)}
                  className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${profile.notification_enabled ? 'bg-indigo-600' : 'bg-[#222]'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${profile.notification_enabled ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
            <div className="bento-card">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-indigo-500" />
                <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Mood Insights</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Background Tracking</p>
                  <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Live mood detection</p>
                </div>
                <div 
                  onClick={() => handleProfileChange('background_tracking_enabled', !profile.background_tracking_enabled, true)}
                  className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${profile.background_tracking_enabled ? 'bg-indigo-600' : 'bg-[#222]'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${profile.background_tracking_enabled ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
            <div className="bento-card">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Privacy</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Public Presence</p>
                <div 
                  onClick={() => handleProfileChange('public_profile', !profile.public_profile, true)}
                  className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${profile.public_profile ? 'bg-indigo-600' : 'bg-[#222]'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${profile.public_profile ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>

            <div className="bento-card md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Report Settings</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-bold">End-of-Day Reports</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Receive deep wellness analysis via email at 10 PM</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <select 
                    value={profile.report_frequency || 'daily'}
                    onChange={(e) => handleProfileChange('report_frequency', e.target.value, true)}
                    className="bg-[#050505] border border-[#1a1a1a] rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 focus:outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>

                  <div 
                    onClick={() => handleProfileChange('report_enabled', !profile.report_enabled, true)}
                    className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${profile.report_enabled ? 'bg-indigo-600' : 'bg-[#222]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${profile.report_enabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">Writing Reminders</p>
                  <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Notify me at 9:30 PM if I haven't journaled</p>
                </div>
                <div 
                  onClick={() => handleProfileChange('notification_enabled', !profile.notification_enabled, true)}
                  className={`w-10 h-5 rounded-full transition-all cursor-pointer relative ${profile.notification_enabled ? 'bg-indigo-600' : 'bg-[#222]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${profile.notification_enabled ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="obsidian-card bg-red-500/5 border-red-500/10">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase mb-8 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              Secure Contacts
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <label className="text-[10px] font-black tracking-widest text-gray-600 uppercase ml-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse or Parent"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="bg-[#050505] border border-[#1a1a1a] rounded-2xl px-5 py-4 text-white focus:border-red-500/50 transition-all text-sm w-full"
                />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="bg-[#050505] border border-[#1a1a1a] rounded-2xl px-5 py-4 text-white focus:border-red-500/50 transition-all text-sm"
              />
            </div>
            
            <button
              onClick={handleAddContact}
              className="w-full py-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-[10px] font-black tracking-widest uppercase text-red-500 hover:bg-red-600/20 transition-all"
            >
              Add Safety Contact
            </button>
          </div>

          <div className="space-y-4">
            {sosContacts.map((contact) => (
              <div key={contact.id} className="bento-card flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{contact.name}</h4>
                    <p className="text-[10px] font-black tracking-widest text-gray-600 uppercase">{contact.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-3 bg-red-500/5 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

