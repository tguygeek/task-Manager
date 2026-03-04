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
  const [selectedCategory, setSelectedCategory] = useState(null); // null = toutes

  // Active les notifications (badge + toast + push)
  useNotifications(tasksList);

  // Filtrage par catégorie + statut
  const filteredTasks = tasksList.filter(task => {
    const matchCategory = selectedCategory === null || task.category_id === selectedCategory;
    const matchStatus =
      filter === 'active'    ? !task.completed :
      filter === 'completed' ? task.completed  : true;
    return matchCategory && matchStatus;
  });

  const { completedTask, incompletedTask } = getTasksCount();

  return (
    <div className={styles.page}>
      <Header onRequestPush={requestPushPermission} />

      <div className={styles.layout}>
        {/* Sidebar catégories */}
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          tasksList={tasksList}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
        />

        {/* Zone principale */}
        <main className={styles.main}>
          <TaskInput
            addTask={addTask}
            categories={categories}
            defaultCategoryId={selectedCategory}
          />
          <TaskList
            tasksList={filteredTasks}
            allCount={tasksList.filter(t => selectedCategory === null || t.category_id === selectedCategory).length}
            activeCount={tasksList.filter(t => !t.completed && (selectedCategory === null || t.category_id === selectedCategory)).length}
            completedCount={tasksList.filter(t => t.completed && (selectedCategory === null || t.category_id === selectedCategory)).length}
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
