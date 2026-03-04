import { useState } from "react";
import { Footer } from "./components/footer/footer";
import { Header } from "./components/header/Header";
import { TaskInput } from "./components/taskInput/taskInput";
import { TaskList } from "./components/tasklist/taskList";
import { Sidebar } from "./components/sidebar/Sidebar";
import { useTasks } from "./hooks/useTasks";
import { useCategories } from "./hooks/useCategories";
import { useNotifications, requestPushPermission } from "./hooks/useNotifications";
import styles from "./TaskContainer.module.css";

export const TaskContainer = () => {
  const { tasksList, loading, addTask, editTask, deleteTask, reorderTasks, getTasksCount } = useTasks();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useNotifications(tasksList);

  // ✅ Filtre réactif — recalculé à chaque changement de tasksList, filter ou selectedCategory
  const filteredTasks = tasksList.filter(task => {
    const matchCategory = selectedCategory === null
      || Number(task.category_id) === Number(selectedCategory); // ✅ comparaison typée
    const matchStatus =
      filter === 'active'    ? !task.completed :
      filter === 'completed' ?  task.completed : true;
    return matchCategory && matchStatus;
  });

  // Compteurs pour les onglets — basés sur la catégorie sélectionnée uniquement
  const tasksInView = selectedCategory === null
    ? tasksList
    : tasksList.filter(t => Number(t.category_id) === Number(selectedCategory));

  const allCount       = tasksInView.length;
  const activeCount    = tasksInView.filter(t => !t.completed).length;
  const completedCount = tasksInView.filter(t =>  t.completed).length;

  const { completedTask, incompletedTask } = getTasksCount();

  return (
    <div className={styles.page}>
      <Header onRequestPush={requestPushPermission} />

      <div className={styles.layout}>
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          tasksList={tasksList}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
        />

        <main className={styles.main}>
          <TaskInput
            addTask={addTask}
            categories={categories}           // ✅ passe bien les catégories
            defaultCategoryId={selectedCategory}
          />
          <TaskList
            tasksList={filteredTasks}
            allCount={allCount}
            activeCount={activeCount}
            completedCount={completedCount}
            filter={filter}
            setFilter={setFilter}
            editTask={editTask}
            deleteTask={deleteTask}
            reorderTasks={reorderTasks}
            loading={loading}
            categories={categories}
          />
        </main>
      </div>

      <Footer completedTask={completedTask} incompletedTask={incompletedTask} />
    </div>
  );
};