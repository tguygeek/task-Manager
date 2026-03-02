import { useState, useEffect } from 'react';
import instance from '../components/axios';

export const useTasks = () => {
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserTasks = async () => {
    try {
      const response = await instance.get('/api/user/tasks');
      setTasksList(response.data.tasks);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserTasks();
  }, []);

  const addTask = async ({ title, description, priority, due_date }) => {
    try {
      const response = await instance.post('/api/tasks', {
        title,
        description: description || null,
        priority: priority || 'medium',
        due_date: due_date || null,
        completed: false,
      });
      if (response.data.success) {
        // Mise à jour optimiste
        setTasksList((prev) => [response.data.task, ...prev]);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Erreur ajout tâche:', error);
      return { success: false, message: 'Erreur lors de l\'ajout' };
    }
  };

  const editTask = async (id, fields) => {
    try {
      const response = await instance.put(`/api/tasks/${id}`, fields);
      if (response.data.success) {
        // Mise à jour optimiste
        setTasksList((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...fields } : t))
        );
        return { success: true };
      }
    } catch (error) {
      console.error('Erreur modification tâche:', error);
      return { success: false };
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await instance.delete(`/api/tasks/${id}`);
      if (response.data.success) {
        // Mise à jour optimiste
        setTasksList((prev) => prev.filter((t) => t.id !== id));
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
      return { success: false };
    }
  };

  const getTasksCount = () => {
    const completedTask = tasksList.filter((t) => t.completed).length;
    const incompletedTask = tasksList.length - completedTask;
    return { completedTask, incompletedTask };
  };

  return { tasksList, loading, addTask, editTask, deleteTask, getTasksCount };
};