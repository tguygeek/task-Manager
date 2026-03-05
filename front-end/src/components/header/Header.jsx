import { useNavigate } from 'react-router-dom';
import instance from '../axios';
import styles from './Header.module.css';
import toast from 'react-hot-toast';

export const Header = ({
  view, setView, onRequestPush, onToggleHistory, onToggleWorkspaces,
  activeWorkspace, historyCount, searchBar,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await instance.post('/api/logout');
    } catch {}
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleEnablePush = async () => {
    const granted = await onRequestPush();
    if (granted) toast.success('Notifications activées !');
  };

  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.brand}>
        <span className={styles.logo}>⚡</span>
        <div className={styles.brandText}>
          <span className={styles.appName}>Taskflow</span>
          {activeWorkspace && (
            <span className={styles.wsIndicator} style={{ color: activeWorkspace.color }}>
              {activeWorkspace.icon} {activeWorkspace.name}
            </span>
          )}
        </div>
      </div>

      {/* Barre de recherche */}
      <div className={styles.center}>{searchBar}</div>

      {/* Navigation vues */}
      <nav className={styles.viewSwitcher}>
        {[
          { id: 'list',      label: '☰ Liste'    },
          { id: 'kanban',    label: '⬛ Kanban'   },
          { id: 'dashboard', label: '📊 Stats'    },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={`${styles.viewBtn} ${view === id ? styles.viewActive : ''}`}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={onToggleWorkspaces} title="Workspaces">🗂️</button>
        <button className={styles.iconBtn} onClick={onToggleHistory} title="Historique & corbeille">
          🗑️{historyCount > 0 && <span className={styles.dot}>{historyCount}</span>}
        </button>
        <button className={styles.iconBtn} onClick={handleEnablePush} title="Activer les notifications">🔔</button>
        <button className={styles.logoutBtn} onClick={handleLogout}>Déconnexion</button>
      </div>
    </header>
  );
};
