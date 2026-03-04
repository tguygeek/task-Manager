import { useState, useEffect } from 'react';
import instance from '../components/axios';

export const useTasks = () => {
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalise une tâche pour que category_id soit toujours un Number ou null
  const normalizeTask = (task) => ({
    ...task,
    category_id: task.category_id ? Number(task.category_id) : null,
    completed:   Boolean(task.completed),
  });

  const getUserTasks = async () => {
    try {
      const response = await instance.get('/api/user/tasks');
      setTasksList(response.data.tasks.map(normalizeTask)); // ✅ normalise à la réception
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserTasks();
  }, []);

  const addTask = async ({ title, description, priority, due_date, category_id }) => {
    try {
      const response = await instance.post('/api/tasks', {
        title,
        description:  description || null,
        priority:     priority || 'medium',
        due_date:     due_date || null,
        category_id:  category_id ? Number(category_id) : null, // ✅ toujours un Number
        completed:    false,
      });

      if (response.data.success) {
        const newTask = normalizeTask(response.data.task); // ✅ normalise la nouvelle tâche
        setTasksList(prev => [newTask, ...prev]);           // ✅ ajout optimiste immédiat
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Erreur ajout tâche:', error);
      return { success: false, message: "Erreur lors de l'ajout" };
    }
  };

  const editTask = async (id, fields) => {
    try {
      const response = await instance.put(`/api/tasks/${id}`, fields);
      if (response.data.success) {
        setTasksList(prev =>
          prev.map(t => t.id === id ? normalizeTask({ ...t, ...fields, category: response.data.task.category }) : t)
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
        setTasksList(prev => prev.filter(t => t.id !== id));
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
      return { success: false };
    }
  };

  const reorderTasks = async (newTasksList) => {
    setTasksList(newTasksList.map(normalizeTask));

    const payload = newTasksList.map((task, index) => ({
      id:          task.id,
      position:    index,
      category_id: task.category_id,
    }));

    try {
      await instance.post('/api/tasks/reorder', { tasks: payload });
    } catch (error) {
      console.error('Erreur reorder:', error);
      getUserTasks(); // rollback
    }
  };

  const getTasksCount = () => {
    const completedTask   = tasksList.filter(t => t.completed).length;
    const incompletedTask = tasksList.length - completedTask;
    return { completedTask, incompletedTask };
  };

  return { tasksList, loading, addTask, editTask, deleteTask, reorderTasks, getTasksCount };
};