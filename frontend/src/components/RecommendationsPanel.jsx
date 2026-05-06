import React, { useState, useEffect } from 'react';
import { Lightbulb, Check, MapPin, Navigation, Sparkles, Brain, Activity, Heart, Zap } from 'lucide-react';
import { useInterventions } from '../hooks/useAPI';

const RecommendationsPanel = ({ emotion, intensity, onInterventionTriggered }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const { getRecommendations, trigger, loading: triggerLoading } = useInterventions();

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setRequestingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setRequestingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Permission denied or location unavailable');
        setRequestingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Polling for recommendations every 30 seconds
  useEffect(() => {
    if (emotion) {
      handleGetRecommendations();
      const interval = setInterval(handleGetRecommendations, 30000);
      return () => clearInterval(interval);
    }
  }, [emotion, intensity, location]);

  const handleGetRecommendations = async () => {
    if (!emotion) return;
    
    setLoading(true);
    try {
      const result = await getRecommendations(emotion, intensity, location);
      setRecommendations(result.interventions || []);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerIntervention = async (interventionType) => {
    setSelectedIntervention(interventionType);
    try {
      await trigger(interventionType, {});
      onInterventionTriggered?.(interventionType);
      
      // Auto-clear after 2 seconds
      setTimeout(() => setSelectedIntervention(null), 2000);
    } catch (error) {
      console.error('Error triggering intervention:', error);
      setSelectedIntervention(null);
    }
  };

  const interventionIcons = {
    breathing_exercise: '🫁',
    meditation: '🧘',
    grounding: '🌍',
    movement: '🏃',
    journaling: '📝',
    social_connection: '👥',
    self_care: '💆',
    creative: '🎨',
    physical: '🏋️',
    social: '☕',
    quiet: '🤫',
    tech: '💻',
  };

  const interventionDescriptions = {
    breathing_exercise: 'Guided breathing exercise to calm your mind',
    meditation: 'Short meditation session for relaxation',
    grounding: '5-senses grounding technique',
    movement: 'Light physical activity or stretching',
    journaling: 'Reflective writing prompt',
    social_connection: 'Connect with a friend or loved one',
    self_care: 'Self-care activity suggestion',
  };

  return (
    <div className="emotion-card bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Recommendations</h2>
        <Lightbulb className="w-6 h-6 text-amber-500" />
      </div>

      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${location ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {location ? <Navigation className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-700">Location Context</h3>
              <p className="text-xs text-slate-500">
                {location 
                  ? `Active: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : locationError || 'Enable location for local intervention suggestions'}
              </p>
            </div>
          </div>
          {!location && (
            <button 
              onClick={handleRequestLocation}
              disabled={requestingLocation}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {requestingLocation ? 'Requesting...' : 'Enable Location'}
            </button>
          )}
        </div>
      </div>

      {!recommendations.length ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            {emotion ? 'Get personalized recommendations' : 'Record an emotion first to get recommendations'}
          </p>
          {emotion && (
            <button
              onClick={handleGetRecommendations}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="loading-spinner mr-2"></span>
                  Loading...
                </>
              ) : (
                'Get Recommendations'
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <button
              key={rec.id || rec.type_id}
              onClick={() => handleTriggerIntervention(rec.type_id || rec.type)}
              disabled={triggerLoading || selectedIntervention !== null}
              className={`p-5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden ${
                selectedIntervention === (rec.type_id || rec.type)
                  ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : rec.is_ai 
                    ? 'bg-[#1a1a1a] border-[#333] hover:border-indigo-500/50 hover:bg-indigo-500/5'
                    : 'bg-white border-slate-100 hover:border-blue-500 hover:bg-blue-50'
              } disabled:opacity-50`}
            >
              {rec.is_ai && (
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Sparkles className="w-12 h-12 text-indigo-500" />
                </div>
              )}

              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                      rec.is_ai ? 'bg-indigo-500/10' : 'bg-slate-50'
                    }`}>
                      {interventionIcons[rec.type] || '✨'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${rec.is_ai ? 'text-white' : 'text-slate-800'}`}>
                          {rec.title}
                        </h3>
                        {rec.is_ai && (
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[8px] font-black tracking-widest uppercase rounded-full border border-indigo-500/30 flex items-center gap-1">
                            <Sparkles className="w-2 h-2" /> AI Suggested
                          </span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed ${rec.is_ai ? 'text-slate-400' : 'text-slate-500'}`}>
                        {rec.description || interventionDescriptions[rec.type]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    {rec.duration_minutes && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Activity className="w-3 h-3" />
                        {rec.duration_minutes} min
                      </div>
                    )}
                    {rec.is_ai && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400/70 uppercase tracking-wider">
                        <Brain className="w-3 h-3" />
                        Personalized
                      </div>
                    )}
                  </div>
                </div>
                {selectedIntervention === (rec.type_id || rec.type) && (
                  <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <button
          onClick={handleGetRecommendations}
          disabled={loading}
          className="mt-4 w-full btn-secondary text-sm"
        >
          Refresh Recommendations
        </button>
      )}
    </div>
  );
};

export default RecommendationsPanel;
