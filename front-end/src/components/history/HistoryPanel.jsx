import { useState } from 'react';
import styles from './HistoryPanel.module.css';

const ACTION_CONFIG = {
  created:  { icon: '✨', color: '#10b981' },
  updated:  { icon: '✏️',  color: '#f59e0b' },
  deleted:  { icon: '🗑️',  color: '#e74c3c' },
  restored: { icon: '♻️',  color: '#3b82f6' },
};

export const HistoryPanel = ({ history, trashList, onRestore, onForceDelete, onUndo, lastAction, onClose }) => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'trash'

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 Historique
            <span className={styles.badge}>{history.length}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'trash' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('trash')}
          >
            🗑️ Corbeille
            <span className={styles.badge}>{trashList.length}</span>
          </button>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      {/* Ctrl+Z hint */}
      {lastAction && (
        <div className={styles.undoBar}>
          <span>Dernière action : {lastAction.description}</span>
          <button className={styles.undoBtn} onClick={onUndo}>↩ Annuler (Ctrl+Z)</button>
        </div>
      )}

      {/* Contenu */}
      <div className={styles.body}>
        {activeTab === 'history' ? (
          history.length === 0 ? (
            <div className={styles.empty}>Aucune action enregistrée</div>
          ) : (
            <ul className={styles.list}>
              {history.map(entry => {
                const config = ACTION_CONFIG[entry.action] || { icon: '•', color: '#888' };
                return (
                  <li key={entry.id} className={styles.historyItem}>
                    <span className={styles.histIcon}>{config.icon}</span>
                    <div className={styles.histInfo}>
                      <span className={styles.histDesc}>{entry.description}</span>
                      <span className={styles.histDate}>
                        {new Date(entry.created_at).toLocaleString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span className={styles.histBadge} style={{ background: `${config.color}22`, color: config.color }}>
                      {entry.action}
                    </span>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          trashList.length === 0 ? (
            <div className={styles.empty}>La corbeille est vide 🎉</div>
          ) : (
            <ul className={styles.list}>
              {trashList.map(task => (
                <li key={task.id} className={styles.trashItem}>
                  <div className={styles.trashInfo}>
                    <span className={styles.trashTitle}>{task.title}</span>
                    <span className={styles.trashDate}>
                      Supprimé le {new Date(task.deleted_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className={styles.trashActions}>
                    <button className={styles.restoreBtn} onClick={() => onRestore(task.id)} title="Restaurer">♻️</button>
                    <button className={styles.deleteBtn} onClick={() => {
                      if (window.confirm('Supprimer définitivement ?')) onForceDelete(task.id);
                    }} title="Supprimer définitivement">💀</button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
};
