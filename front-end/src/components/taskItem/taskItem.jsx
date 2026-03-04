import { useState } from "react";
import styles from "./TaskItem.module.css";
import toast from "react-hot-toast";

const PRIORITY_CONFIG = {
  low:    { label: '🟢 Basse',   className: 'low'    },
  medium: { label: '🟡 Moyenne', className: 'medium' },
  high:   { label: '🔴 Haute',   className: 'high'   },
};

const getDueDateInfo = (dueDateStr) => {
  if (!dueDateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(dueDateStr); due.setHours(0,0,0,0);
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return { label: `⚠️ En retard de ${Math.abs(diffDays)}j`, overdue: true };
  if (diffDays === 0) return { label: "📅 Aujourd'hui !", urgent: true };
  if (diffDays === 1) return { label: "📅 Demain", urgent: true };
  return { label: `📅 Dans ${diffDays}j` };
};

export const TaskItem = ({ task, editTask, deleteTask, categories = [], dragHandleProps = {}, isDragging = false }) => {
  const [expanded, setExpanded]     = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [editTitle, setEditTitle]   = useState(task.title);
  const [editDesc, setEditDesc]     = useState(task.description || "");
  const [editPriority, setEditPriority] = useState(task.priority || "medium");
  const [editDueDate, setEditDueDate]   = useState(task.due_date || "");
  const [editCategoryId, setEditCategoryId] = useState(task.category_id || "");

  const priority    = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const dueDateInfo = getDueDateInfo(task.due_date);
  const category    = categories.find(c => c.id === task.category_id);

  const handleToggleComplete = async () => {
    const result = await editTask(task.id, { completed: !task.completed });
    if (!result?.success) toast.error("Erreur lors de la mise à jour");
  };

  const handleDelete = async () => {
    const result = await deleteTask(task.id);
    if (result?.success) toast.success(result.message || "Tâche supprimée !");
    else toast.error("Erreur lors de la suppression");
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) { toast.error("Le titre ne peut pas être vide"); return; }
    const result = await editTask(task.id, {
      title:       editTitle,
      description: editDesc,
      priority:    editPriority,
      due_date:    editDueDate || null,
      category_id: editCategoryId || null,
    });
    if (result?.success) { toast.success("Tâche modifiée !"); setIsEditing(false); }
    else toast.error("Erreur lors de la modification");
  };

  return (
    <div className={`${styles.item} ${task.completed ? styles.completed : ''} ${isDragging ? styles.dragging : ''}`}>
      {/* Ligne principale */}
      <div className={styles.mainRow}>
        {/* Handle drag */}
        <span className={styles.dragHandle} {...dragHandleProps} title="Glisser pour réordonner">⠿</span>

        {/* Checkbox */}
        <button
          className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
          onClick={handleToggleComplete}
        >{task.completed && <span>✓</span>}</button>

        {/* Infos */}
        <div className={styles.info} onClick={() => !isEditing && setExpanded(!expanded)}>
          <span className={styles.title}>{task.title}</span>
          <div className={styles.meta}>
            {/* Badge catégorie */}
            {category && (
              <span className={styles.categoryBadge} style={{ background: `${category.color}22`, color: category.color, borderColor: `${category.color}44` }}>
                {category.icon} {category.name}
              </span>
            )}
            {/* Badge priorité */}
            <span className={`${styles.priorityBadge} ${styles[priority.className]}`}>{priority.label}</span>
            {/* Date échéance */}
            {dueDateInfo && (
              <span className={`${styles.dueBadge} ${dueDateInfo.overdue ? styles.overdue : dueDateInfo.urgent ? styles.urgent : ''}`}>
                {dueDateInfo.label}
              </span>
            )}
            {task.description && <span className={styles.descIndicator}>📝</span>}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={() => { setIsEditing(!isEditing); setExpanded(true); }}>✏️</button>
          <button className={styles.deleteBtn} onClick={handleDelete}>🗑️</button>
          <button className={styles.expandBtn} onClick={() => setExpanded(!expanded)}>{expanded ? '▲' : '▼'}</button>
        </div>
      </div>

      {/* Accordion */}
      {expanded && (
        <div className={styles.accordion}>
          {isEditing ? (
            <div className={styles.editForm}>
              <input className={styles.editInput} value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Titre" />
              <textarea className={styles.editTextarea} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description..." rows={3} />

              {/* Catégorie */}
              <select className={styles.editSelect} value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)}>
                <option value="">Sans catégorie</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>

              {/* Priorité */}
              <div className={styles.priorityGroup}>
                {[{value:'low',label:'🟢 Basse'},{value:'medium',label:'🟡 Moyenne'},{value:'high',label:'🔴 Haute'}].map(({value,label}) => (
                  <button key={value} type="button"
                    className={`${styles.priorityBtn} ${editPriority === value ? styles[`active_${value}`] : ''}`}
                    onClick={() => setEditPriority(value)}
                  >{label}</button>
                ))}
              </div>

              {/* Date */}
              <input type="date" className={styles.editDate} value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />

              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={handleSaveEdit}>💾 Sauvegarder</button>
                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Annuler</button>
              </div>
            </div>
          ) : (
            <div className={styles.descContent}>
              {task.description
                ? <p>{task.description}</p>
                : <p className={styles.noDesc}>Aucune description. Clique sur ✏️ pour en ajouter une.</p>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};
