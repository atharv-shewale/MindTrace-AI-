import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { journalAPI } from '../utils/api';

const EmotionHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await journalAPI.list({ limit: 5 });
      setEntries(response.data.entries || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionBadgeColor = (emotion) => {
    const colors = {
      joy: 'bg-yellow-100 text-yellow-800',
      calm: 'bg-green-100 text-green-800',
      sadness: 'bg-blue-100 text-blue-800',
      anxiety: 'bg-purple-100 text-purple-800',
      stress: 'bg-red-100 text-red-800',
      anger: 'bg-orange-100 text-orange-800',
      neutral: 'bg-gray-100 text-gray-800',
    };
    return colors[emotion] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="emotion-card bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Entries</h2>
        <History className="w-6 h-6 text-purple-500" />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No entries yet. Start journaling to see your emotional journey!</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry._id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getEmotionBadgeColor(entry.dominant_emotion)}`}>
                      {entry.dominant_emotion}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(entry.created_at)}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={fetchEntries}
        disabled={loading}
        className="mt-4 w-full btn-secondary text-sm"
      >
        Refresh
      </button>
    </div>
  );
};

export default EmotionHistory;
