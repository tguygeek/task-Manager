import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { TaskItem } from "../taskItem/taskItem";
import { SortableTaskItem } from "../taskItem/SortableTaskItem";
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
  reorderTasks,
  loading,
  categories,
}) => {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const tabs = [
    { key: 'all',       label: 'Tout',      count: allCount       },
    { key: 'active',    label: 'En cours',  count: activeCount    },
    { key: 'completed', label: 'Terminées', count: completedCount },
  ];

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = tasksList.findIndex(t => t.id === active.id);
    const newIndex = tasksList.findIndex(t => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Réordonne localement et persiste
    const reordered = arrayMove(tasksList, oldIndex, newIndex);

    // Met à jour la category_id si on déplace entre catégories
    const targetTask = tasksList[newIndex];
    const updatedList = reordered.map((task, i) =>
      task.id === active.id
        ? { ...task, category_id: targetTask.category_id }
        : task
    );

    reorderTasks(updatedList);
  };

  const activeTask = activeId ? tasksList.find(t => t.id === activeId) : null;

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

      {/* Liste avec DnD */}
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasksList.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className={styles.list}>
              {tasksList.map(task => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  editTask={editTask}
                  deleteTask={deleteTask}
                  categories={categories}
                />
              ))}
            </ul>
          </SortableContext>

          {/* Aperçu fantôme pendant le drag */}
          <DragOverlay>
            {activeTask && (
              <div className={styles.dragOverlay}>
                <TaskItem
                  task={activeTask}
                  editTask={editTask}
                  deleteTask={deleteTask}
                  categories={categories}
                  isDragging
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};
