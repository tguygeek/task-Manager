import { useState, useEffect } from 'react';
import instance from '../components/axios';
import toast from 'react-hot-toast';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await instance.get('/api/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async ({ name, color, icon }) => {
    try {
      const res = await instance.post('/api/categories', { name, color, icon });
      if (res.data.success) {
        setCategories(prev => [...prev, res.data.category]);
        toast.success(res.data.message);
        return { success: true };
      }
    } catch (err) {
      toast.error('Erreur lors de la création');
      return { success: false };
    }
  };

  const updateCategory = async (id, fields) => {
    try {
      const res = await instance.put(`/api/categories/${id}`, fields);
      if (res.data.success) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...fields } : c));
        toast.success(res.data.message);
        return { success: true };
      }
    } catch (err) {
      toast.error('Erreur lors de la modification');
      return { success: false };
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await instance.delete(`/api/categories/${id}`);
      if (res.data.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success(res.data.message);
        return { success: true };
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression');
      return { success: false };
    }
  };

  const seedDefaults = async () => {
    try {
      await instance.post('/api/categories/seed');
      await fetchCategories();
    } catch (err) {
      console.error('Erreur seed catégories:', err);
    }
  };

  return { categories, loadingCategories, addCategory, updateCategory, deleteCategory, seedDefaults };
};
