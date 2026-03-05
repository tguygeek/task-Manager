import { useState, useEffect, useCallback } from 'react';
import instance from '../components/axios';
import toast from 'react-hot-toast';

export const useHistory = (onTaskRestored) => {
  const [history, setHistory]       = useState([]);
  const [trashList, setTrashList]   = useState([]);
  const [lastAction, setLastAction] = useState(null); // pour Ctrl+Z

  const fetchHistory = async () => {
    try {
      const res = await instance.get('/api/history');
      setHistory(res.data.history);
    } catch (err) { console.error('Erreur historique:', err); }
  };

  const fetchTrash = async () => {
    try {
      const res = await instance.get('/api/tasks/trash');
      setTrashList(res.data.tasks);
    } catch (err) { console.error('Erreur corbeille:', err); }
  };

  useEffect(() => {
    fetchHistory();
    fetchTrash();
  }, []);

  // Restaurer une tâche depuis la corbeille
  const restoreTask = async (id) => {
    try {
      const res = await instance.post(`/api/tasks/${id}/restore`);
      if (res.data.success) {
        setTrashList(prev => prev.filter(t => t.id !== id));
        toast.success(res.data.message);
        onTaskRestored?.(res.data.task); // notifie TaskContainer
        await fetchHistory();
        return { success: true };
      }
    } catch { toast.error('Erreur lors de la restauration'); return { success: false }; }
  };

  // Suppression définitive
  const forceDelete = async (id) => {
    try {
      const res = await instance.delete(`/api/tasks/${id}/force`);
      if (res.data.success) {
        setTrashList(prev => prev.filter(t => t.id !== id));
        toast.success(res.data.message);
      }
    } catch { toast.error('Erreur lors de la suppression définitive'); }
  };

  // Enregistrer la dernière action pour Ctrl+Z
  const recordAction = useCallback((action) => {
    setLastAction(action);
  }, []);

  // Ctrl+Z — annule la dernière action
  const undoLastAction = useCallback(async () => {
    if (!lastAction) { toast('Aucune action à annuler', { icon: 'ℹ️' }); return; }

    if (lastAction.type === 'delete') {
      await restoreTask(lastAction.taskId);
      toast.success('Action annulée — tâche restaurée !');
    }
    setLastAction(null);
  }, [lastAction]);

  // Écouter Ctrl+Z globalement
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoLastAction();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undoLastAction]);

  return {
    history, trashList, lastAction,
    restoreTask, forceDelete, recordAction, undoLastAction,
    refreshHistory: fetchHistory, refreshTrash: fetchTrash,
  };
};
