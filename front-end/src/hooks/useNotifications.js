import { useEffect } from 'react';
import toast from 'react-hot-toast';

// ─── Badge sur l'onglet (favicon dynamique) ──────────────────────────────────
const setFaviconBadge = (count) => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Dessine le favicon de base (emoji ⚡)
  ctx.font = '24px serif';
  ctx.fillText('⚡', 2, 26);

  if (count > 0) {
    // Badge rouge
    ctx.beginPath();
    ctx.arc(26, 6, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();

    // Nombre
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(count > 9 ? '9+' : count, 26, 10);
  }

  const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
  link.rel = 'icon';
  link.href = canvas.toDataURL();
  document.head.appendChild(link);
};

// ─── Demander la permission Push ─────────────────────────────────────────────
export const requestPushPermission = async () => {
  if (!('Notification' in window)) {
    toast.error("Ton navigateur ne supporte pas les notifications");
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') {
    toast.error("Notifications bloquées. Autorise-les dans les paramètres du navigateur.");
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// ─── Envoyer une notification Push ───────────────────────────────────────────
export const sendPushNotification = (title, body, icon = '/favicon.ico') => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon });
  }
};

// ─── Hook principal ───────────────────────────────────────────────────────────
export const useNotifications = (tasks) => {
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const incompleteTasks = tasks.filter(t => !t.completed && t.due_date);

    const overdue    = incompleteTasks.filter(t => new Date(t.due_date) < today);
    const dueToday   = incompleteTasks.filter(t => {
      const d = new Date(t.due_date);
      return d >= today && d < tomorrow;
    });

    const urgentCount = overdue.length + dueToday.length;

    // Badge sur l'onglet
    setFaviconBadge(urgentCount);

    // Toast au login pour les tâches urgentes
    if (overdue.length > 0) {
      toast.error(
        `⚠️ ${overdue.length} tâche${overdue.length > 1 ? 's' : ''} en retard !`,
        { duration: 6000, id: 'overdue-toast' }
      );
    }
    if (dueToday.length > 0) {
      toast(
        `📅 ${dueToday.length} tâche${dueToday.length > 1 ? 's' : ''} à terminer aujourd'hui`,
        { duration: 5000, id: 'today-toast', icon: '📋' }
      );
    }

    // Push notification si permission accordée
    if (Notification.permission === 'granted' && urgentCount > 0) {
      sendPushNotification(
        '⚡ Taskflow — Rappel',
        `Tu as ${urgentCount} tâche${urgentCount > 1 ? 's' : ''} urgente${urgentCount > 1 ? 's' : ''} !`
      );
    }

    // Nettoyage : remettre le badge à 0 quand les tâches changent
    return () => setFaviconBadge(0);
  }, [tasks]);
};
