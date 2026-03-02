import { TaskItem } from "../taskItem/taskItem";
import styles from "./TaskList.module.css";

export const TaskList = ({
  tasksList,
  allCount,
  activeCount,
  completedCount,
  filter,
  setFilter,
  editTask,
  deleteTask,
  loading,
}) => {
  const tabs = [
    { key: 'all',       label: 'Tout',      count: allCount       },
    { key: 'active',    label: 'En cours',  count: activeCount    },
    { key: 'completed', label: 'Terminées', count: completedCount },
  ];

  return (
    <div className={styles.container}>
      {/* Onglets filtres */}
      <div className={styles.tabs}>
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            className={`${styles.tab} ${filter === key ? styles.activeTab : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
            <span className={styles.badge}>{count}</span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Chargement des tâches...</span>
        </div>
      ) : tasksList.length === 0 ? (
        <div className={styles.empty}>
          {filter === 'all'
            ? "👋 salut tu n'as rien à faire, profite de ton temps libre !"
            : filter === 'active'
            ? "✅ Aucune tâche en cours !"
            : "📭 Aucune tâche terminée pour l'instant."}
        </div>
      ) : (
        <ul className={styles.list}>
          {tasksList.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              editTask={editTask}
              deleteTask={deleteTask}
            />
          ))}
        </ul>
      )}
    </div>
  );
};