import { useState, useEffect } from 'react';
import instance from '../components/axios';

export const useDashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await instance.get('/api/dashboard');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  return { stats, loading, refresh: fetchDashboard };
};
