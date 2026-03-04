import { useState } from 'react';
import styles from './sidebar.module.css';

export const Sidebar = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  tasksList,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [newIcon, setNewIcon] = useState('📁');

  const EMOJI_OPTIONS = ['📁','💼','🏠','🚨','🛒','❤️','📚','🎯','💡','🎨','🏋️','🌍'];
  const COLOR_OPTIONS = ['#6366f1','#3b82f6','#10b981','#ef4444','#f59e0b','#8b5cf6','#ec4899','#14b8a6'];

  const getTaskCount = (categoryId) =>
    tasksList.filter(t => t.category_id === categoryId && !t.completed).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const result = await onAddCategory({ name: newName, color: newColor, icon: newIcon });
    if (result?.success) {
      setNewName(''); setNewColor('#6366f1'); setNewIcon('📁');
      setShowForm(false);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Catégories</span>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)} title="Nouvelle catégorie">+</button>
      </div>

      {/* Formulaire nouvelle catégorie */}
      {showForm && (
        <form className={styles.addForm} onSubmit={handleSubmit}>
          <input
            className={styles.nameInput}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nom de la catégorie"
            autoFocus
          />
          {/* Choix emoji */}
          <div className={styles.emojiGrid}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} type="button"
                className={`${styles.emojiBtn} ${newIcon === e ? styles.emojiActive : ''}`}
                onClick={() => setNewIcon(e)}
              >{e}</button>
            ))}
          </div>
          {/* Choix couleur */}
          <div className={styles.colorGrid}>
            {COLOR_OPTIONS.map(c => (
              <button key={c} type="button"
                className={`${styles.colorDot} ${newColor === c ? styles.colorActive : ''}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn}>Créer</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      {/* Liste catégories */}
      <nav className={styles.nav}>
        {/* Option "Toutes" */}
        <button
          className={`${styles.navItem} ${selectedCategory === null ? styles.active : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navLabel}>Toutes les tâches</span>
          <span className={styles.navCount}>{tasksList.filter(t => !t.completed).length}</span>
        </button>

        {/* Catégories */}
        {categories.map(cat => (
          <div key={cat.id} className={styles.navRow}>
            <button
              className={`${styles.navItem} ${selectedCategory === cat.id ? styles.active : ''}`}
              style={selectedCategory === cat.id ? { borderLeftColor: cat.color } : {}}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className={styles.navIcon}>{cat.icon}</span>
              <span className={styles.navLabel}>{cat.name}</span>
              <span className={styles.navCount}>{getTaskCount(cat.id)}</span>
            </button>
            {!cat.is_default && (
              <button
                className={styles.deleteBtn}
                onClick={() => onDeleteCategory(cat.id)}
                title="Supprimer la catégorie"
              >×</button>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
