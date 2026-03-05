import { useRef, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch';
import styles from './SearchBar.module.css';

export const SearchBar = ({ onNavigate }) => {
  const { query, setQuery, results, searching, isOpen, setIsOpen, totalResults, clearSearch } = useSearch();
  const containerRef = useRef(null);

  // Fermer si clic en dehors
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (type, item) => {
    clearSearch();
    onNavigate?.(type, item);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper}>
        <span className={styles.icon}>{searching ? '⟳' : '🔍'}</span>
        <input
          className={styles.input}
          type="text"
          placeholder="Rechercher tâches, catégories, workspaces..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {query && (
          <button className={styles.clearBtn} onClick={clearSearch}>×</button>
        )}
      </div>

      {/* Dropdown résultats */}
      {isOpen && (
        <div className={styles.dropdown}>
          {totalResults === 0 && !searching ? (
            <div className={styles.noResults}>Aucun résultat pour « {query} »</div>
          ) : (
            <>
              {/* Tâches */}
              {results.tasks.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Tâches</div>
                  {results.tasks.map(task => (
                    <button key={task.id} className={styles.resultItem} onClick={() => handleSelect('task', task)}>
                      <span className={styles.resultIcon}>
                        {task.status === 'done' ? '✅' : task.status === 'in_progress' ? '⚡' : '📋'}
                      </span>
                      <div className={styles.resultInfo}>
                        <span className={`${styles.resultTitle} ${task.status === 'done' ? styles.strikethrough : ''}`}>
                          {highlightMatch(task.title, query)}
                        </span>
                        {task.category && (
                          <span className={styles.resultMeta} style={{ color: task.category.color }}>
                            {task.category.icon} {task.category.name}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Catégories */}
              {results.categories.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Catégories</div>
                  {results.categories.map(cat => (
                    <button key={cat.id} className={styles.resultItem} onClick={() => handleSelect('category', cat)}>
                      <span className={styles.resultIcon}>{cat.icon}</span>
                      <span className={styles.resultTitle}>{highlightMatch(cat.name, query)}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Workspaces */}
              {results.workspaces.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionTitle}>Workspaces</div>
                  {results.workspaces.map(ws => (
                    <button key={ws.id} className={styles.resultItem} onClick={() => handleSelect('workspace', ws)}>
                      <span className={styles.resultIcon}>{ws.icon}</span>
                      <span className={styles.resultTitle}>{highlightMatch(ws.name, query)}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Surligne le terme recherché dans le texte
const highlightMatch = (text, query) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: 'rgba(231,76,60,0.3)', color: '#fff', borderRadius: '2px' }}>{part}</mark>
      : part
  );
};
