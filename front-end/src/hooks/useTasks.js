import { useState, useEffect } from 'react';
import instance from '../components/axios';

export const useTasks = () => {
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading]     = useState(true);

  const normalizeTask = (task) => ({
    ...task,
    category_id:  task.category_id  ? Number(task.category_id)  : null,
    workspace_id: task.workspace_id ? Number(task.workspace_id) : null,
    completed:    Boolean(task.completed),
    status:       task.status || 'todo',
  });

  const getUserTasks = async () => {
    try {
      const res = await instance.get('/api/user/tasks');
      setTasksList(res.data.tasks.map(normalizeTask));
    } catch (err) {
      console.error('Erreur récupération tâches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getUserTasks(); }, []);

  const addTask = async ({ title, description, priority, due_date, category_id, workspace_id }) => {
    try {
      const res = await instance.post('/api/tasks', {
        title, description: description || null,
        priority: priority || 'medium',
        due_date: due_date || null,
        category_id:  category_id  ? Number(category_id)  : null,
        workspace_id: workspace_id ? Number(workspace_id) : null,
        completed: false, status: 'todo',
      });
      if (res.data.success) {
        setTasksList(prev => [normalizeTask(res.data.task), ...prev]);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, message: "Erreur lors de l'ajout" };
    }
  };

  const editTask = async (id, fields) => {
    try {
      const res = await instance.put(`/api/tasks/${id}`, fields);
      if (res.data.success) {
        setTasksList(prev => prev.map(t =>
          t.id === id ? normalizeTask({ ...t, ...fields, category: res.data.task.category }) : t
        ));
        return { success: true };
      }
    } catch { return { success: false }; }
  };

  const deleteTask = async (id) => {
    try {
      const res = await instance.delete(`/api/tasks/${id}`);
      if (res.data.success) {
        setTasksList(prev => prev.filter(t => t.id !== id));
        return { success: true, message: res.data.message };
      }
    } catch { return { success: false }; }
  };

  // Utilisé par useHistory pour réinjecter une tâche restaurée
  const addTaskToList = (task) => {
    setTasksList(prev => {
      const exists = prev.find(t => t.id === task.id);
      if (exists) return prev;
      return [normalizeTask(task), ...prev];
    });
  };

  const reorderTasks = async (newList) => {
    setTasksList(newList.map(normalizeTask));
    const payload = newList.map((t, i) => ({ id: t.id, position: i, category_id: t.category_id, status: t.status }));
    try {
      await instance.post('/api/tasks/reorder', { tasks: payload });
    } catch { getUserTasks(); }
  };

  const getTasksCount = () => ({
    completedTask:   tasksList.filter(t => t.completed).length,
    incompletedTask: tasksList.filter(t => !t.completed).length,
  });

  return { tasksList, loading, addTask, editTask, deleteTask, addTaskToList, reorderTasks, getTasksCount };
};
