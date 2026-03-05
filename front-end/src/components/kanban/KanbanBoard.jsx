import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './KanbanBoard.module.css';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo',        label: '📋 À faire',   color: '#6366f1' },
  { id: 'in_progress', label: '⚡ En cours',  color: '#f59e0b' },
  { id: 'done',        label: '✅ Terminé',   color: '#10b981' },
];

const PRIORITY_COLORS = { low: '#2ecc71', medium: '#f1c40f', high: '#e74c3c' };

// Carte tâche dans le Kanban
const KanbanCard = ({ task, editTask, deleteTask }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`${styles.card} ${isDragging ? styles.dragging : ''}`}>
      <div className={styles.cardDrag} {...attributes} {...listeners}>⠿</div>
      <div className={styles.cardBody}>
        <p className={`${styles.cardTitle} ${task.status === 'done' ? styles.done : ''}`}>{task.title}</p>
        <div className={styles.cardMeta}>
          {task.category && (
            <span className={styles.catBadge} style={{ background: `${task.category.color}22`, color: task.category.color }}>
              {task.category.icon} {task.category.name}
            </span>
          )}
          <span className={styles.priDot} style={{ background: PRIORITY_COLORS[task.priority] }} title={task.priority} />
          {task.due_date && (
            <span className={styles.dueBadge}>📅 {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          )}
        </div>
      </div>
      <div className={styles.cardActions}>
        <button onClick={() => deleteTask(task.id)} className={styles.delBtn} title="Supprimer">🗑️</button>
      </div>
    </div>
  );
};

export const KanbanBoard = ({ tasksList, editTask, deleteTask, reorderTasks, categories }) => {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const getByStatus = (status) => tasksList.filter(t => (t.status || 'todo') === status);

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeTask = tasksList.find(t => t.id === active.id);
    const overTask   = tasksList.find(t => t.id === over.id);

    // Déplacement entre colonnes
    if (activeTask && overTask && activeTask.status !== overTask.status) {
      const newStatus    = overTask.status || 'todo';
      const newCompleted = newStatus === 'done';
      const result = await editTask(active.id, { status: newStatus, completed: newCompleted });
      if (!result?.success) toast.error('Erreur lors du déplacement');
      return;
    }

    // Réordonnement dans la même colonne
    const oldIndex = tasksList.findIndex(t => t.id === active.id);
    const newIndex = tasksList.findIndex(t => t.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderTasks(arrayMove(tasksList, oldIndex, newIndex));
    }
  };

  const activeTask = activeId ? tasksList.find(t => t.id === activeId) : null;

  return (
    <div className={styles.board}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map(col => {
          const colTasks = getByStatus(col.id);
          return (
            <div key={col.id} className={styles.column}>
              {/* En-tête colonne */}
              <div className={styles.colHeader} style={{ borderTopColor: col.color }}>
                <span className={styles.colTitle}>{col.label}</span>
                <span className={styles.colCount} style={{ background: `${col.color}22`, color: col.color }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Cartes */}
              <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className={styles.colBody}>
                  {colTasks.length === 0 ? (
                    <div className={styles.emptyCol}>Aucune tâche</div>
                  ) : (
                    colTasks.map(task => (
                      <KanbanCard
                        key={task.id}
                        task={task}
                        editTask={editTask}
                        deleteTask={deleteTask}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}

        <DragOverlay>
          {activeTask && (
            <div className={`${styles.card} ${styles.overlay}`}>
              <p className={styles.cardTitle}>{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
