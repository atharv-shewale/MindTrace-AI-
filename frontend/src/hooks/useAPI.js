import { useState, useCallback } from 'react';
import { emotionAPI, journalAPI, analyticsAPI, interventionAPI } from '../utils/api';

export const useEmotionDetect = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detect = useCallback(async (text) => {
    setLoading(true);
    setError(null);
    try {
      const response = await emotionAPI.detect(text);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { detect, loading, error };
};

export const useEmotionRecord = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const record = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await emotionAPI.record(data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { record, loading, error };
};

export const useEmotionStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const getStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await emotionAPI.getStatus();
      setStatus(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getStatus, status, loading, error };
};

export const useJournalCreate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await journalAPI.create(data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const getDailyScore = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsAPI.getDailyScore({ date });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInsights = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsAPI.getInsights({ date });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getDailyScore, getInsights, data, loading, error };
};

export const useInterventions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendations = useCallback(async (emotion, severity, location = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = { emotion, severity };
      if (location) {
        params.lat = location.latitude;
        params.lng = location.longitude;
      }
      const response = await interventionAPI.getRecommendations(params);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const trigger = useCallback(async (type, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await interventionAPI.trigger(type, data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getRecommendations, trigger, loading, error };
};
