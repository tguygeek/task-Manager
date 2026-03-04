import { useState, useEffect } from "react";
import styles from "./TaskInput.module.css";
import toast from "react-hot-toast";

export const TaskInput = ({ addTask, categories = [], defaultCategoryId = null }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showExtra, setShowExtra] = useState(false);

  // Quand la catégorie sélectionnée dans la sidebar change, pré-sélectionner dans le formulaire
  useEffect(() => {
    setCategoryId(defaultCategoryId ? String(defaultCategoryId) : "");
  }, [defaultCategoryId]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setCategoryId(defaultCategoryId ? String(defaultCategoryId) : "");
    setShowExtra(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Le titre est obligatoire !");
      return;
    }

    const result = await addTask({
      title: title.trim(),
      description,
      priority,
      due_date: dueDate || null,
      category_id: categoryId ? parseInt(categoryId) : null, // ✅ converti en int ou null
    });

    if (result?.success) {
      toast.success(result.message || "Tâche ajoutée !");
      resetForm();
    } else {
      toast.error(result?.message || "Erreur lors de l'ajout");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>🎯 Ajoute ta 1ère tâche</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Ligne principale */}
        <div className={styles.mainRow}>
          <input
            type="text"
            className={styles.input}
            placeholder="Indiquer un titre de tâche explicite"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <button type="submit" className={styles.addBtn}>Ajouter</button>
        </div>

        {/* Toggle options avancées */}
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setShowExtra(!showExtra)}
        >
          {showExtra ? "▲ Masquer les options" : "▼ Options avancées"}
        </button>

        {showExtra && (
          <div className={styles.extraFields}>

            {/* ✅ Sélecteur de catégorie — visible seulement si des catégories existent */}
            {categories.length > 0 && (
              <div className={styles.field}>
                <label>Catégorie</label>
                <select
                  className={styles.select}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Sans catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Priorité */}
            <div className={styles.field}>
              <label>Priorité</label>
              <div className={styles.priorityGroup}>
                {[
                  { value: 'low',    label: '🟢 Basse'   },
                  { value: 'medium', label: '🟡 Moyenne'  },
                  { value: 'high',   label: '🔴 Haute'    },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.priorityBtn} ${priority === value ? styles.priorityActive : ''} ${styles[value]}`}
                    onClick={() => setPriority(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date d'échéance */}
            <div className={styles.field}>
              <label>Date d'échéance</label>
              <input
                type="date"
                className={styles.dateInput}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Description */}
            <div className={styles.field}>
              <label>Description</label>
              <textarea
                className={styles.textarea}
                placeholder="Décris ta tâche en détail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};