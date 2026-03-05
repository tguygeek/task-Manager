import { useState, useEffect } from 'react';
import instance from '../components/axios';
import toast from 'react-hot-toast';

export const useWorkspace = () => {
  const [workspaces, setWorkspaces]       = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null); // null = personnel
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchWorkspaces(); }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await instance.get('/api/workspaces');
      setWorkspaces(res.data.workspaces);
    } catch (err) {
      console.error('Erreur workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async ({ name, description, icon, color }) => {
    try {
      const res = await instance.post('/api/workspaces', { name, description, icon, color });
      if (res.data.success) {
        setWorkspaces(prev => [...prev, res.data.workspace]);
        toast.success(res.data.message);
        return { success: true, workspace: res.data.workspace };
      }
    } catch { toast.error('Erreur lors de la création'); return { success: false }; }
  };

  const deleteWorkspace = async (id) => {
    try {
      const res = await instance.delete(`/api/workspaces/${id}`);
      if (res.data.success) {
        setWorkspaces(prev => prev.filter(w => w.id !== id));
        if (activeWorkspace?.id === id) setActiveWorkspace(null);
        toast.success(res.data.message);
      }
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const inviteByEmail = async (workspaceId, email) => {
    try {
      const res = await instance.post(`/api/workspaces/${workspaceId}/invite`, { email });
      if (res.data.success) { toast.success(res.data.message); return { success: true }; }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur d'invitation");
      return { success: false };
    }
  };

  const generateInviteLink = async (workspaceId) => {
    try {
      const res = await instance.post(`/api/workspaces/${workspaceId}/invite-link`);
      if (res.data.success) return { success: true, link: res.data.link };
    } catch { toast.error("Erreur génération du lien"); return { success: false }; }
  };

  const acceptInvitation = async (token) => {
    try {
      const res = await instance.get(`/api/invitations/${token}/accept`);
      if (res.data.success) {
        toast.success(res.data.message);
        await fetchWorkspaces();
        return { success: true, workspace: res.data.workspace };
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invitation invalide ou expirée");
      return { success: false };
    }
  };

  return {
    workspaces, activeWorkspace, setActiveWorkspace, loading,
    createWorkspace, deleteWorkspace, inviteByEmail, generateInviteLink, acceptInvitation,
  };
};
