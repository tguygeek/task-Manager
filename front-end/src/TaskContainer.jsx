import { useState } from "react";
import { Footer }           from "./components/footer/footer";
import { Header }           from "./components/header/Header";
import { TaskInput }        from "./components/taskInput/taskInput";
import { TaskList }         from "./components/tasklist/taskList";
import { Sidebar }          from "./components/sidebar/Sidebar";
import { KanbanBoard }      from "./components/kanban/KanbanBoard";
import { Dashboard }        from "./components/dashboard/Dashboard";
import { SearchBar }        from "./components/search/SearchBar";
import { HistoryPanel }     from "./components/history/HistoryPanel";
import { WorkspaceManager } from "./components/workspace/WorkspaceManager";
import { useTasks }         from "./hooks/useTasks";
import { useCategories }    from "./hooks/useCategories";
import { useWorkspace }     from "./hooks/useWorkspace";
import { useHistory }       from "./hooks/useHistory";
import { useNotifications, requestPushPermission } from "./hooks/useNotifications";
import styles from "./TaskContainer.module.css";

export const TaskContainer = () => {
  // Hooks
  const { tasksList, loading, addTask, editTask, deleteTask, reorderTasks, getTasksCount, addTaskToList } = useTasks();
  const { categories, addCategory, deleteCategory, seedDefaults } = useCategories();
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, deleteWorkspace, inviteByEmail, generateInviteLink } = useWorkspace();
  const { history, trashList, lastAction, restoreTask, forceDelete, recordAction, undoLastAction } = useHistory((restoredTask) => {
    addTaskToList(restoredTask); // réinjecte la tâche restaurée dans la liste
  });

  useNotifications(tasksList);

  // UI state
  const [view, setView]                   = useState('list');    // 'list' | 'kanban' | 'dashboard'
  const [filter, setFilter]               = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showHistory, setShowHistory]     = useState(false);
  const [showWorkspaces, setShowWorkspaces] = useState(false);

  // Filtre combiné : workspace + catégorie + statut
  const filteredTasks = tasksList.filter(task => {
    const matchWorkspace = activeWorkspace === null
      ? !task.workspace_id
      : Number(task.workspace_id) === Number(activeWorkspace?.id);
    const matchCategory = selectedCategory === null
      || Number(task.category_id) === Number(selectedCategory);
    const matchStatus =
      filter === 'active'    ? !task.completed :
      filter === 'completed' ?  task.completed : true;
    return matchWorkspace && matchCategory && matchStatus;
  });

  const tasksInView    = tasksList.filter(t => activeWorkspace === null ? !t.workspace_id : Number(t.workspace_id) === Number(activeWorkspace?.id));
  const allCount       = tasksInView.length;
  const activeCount    = tasksInView.filter(t => !t.completed).length;
  const completedCount = tasksInView.filter(t =>  t.completed).length;

  const { completedTask, incompletedTask } = getTasksCount();

  // Suppression avec enregistrement pour Ctrl+Z
  const handleDeleteTask = async (id) => {
    const task = tasksList.find(t => t.id === id);
    const result = await deleteTask(id);
    if (result?.success && task) {
      recordAction({ type: 'delete', taskId: id, description: `Tâche "${task.title}" supprimée` });
    }
    return result;
  };

  // Navigation depuis la recherche
  const handleSearchNavigate = (type, item) => {
    if (type === 'category') setSelectedCategory(item.id);
    if (type === 'workspace') { setActiveWorkspace(item); setShowWorkspaces(false); }
    // Pour 'task' : on pourrait scroller vers la tâche
  };

  return (
    <div className={styles.page}>
      <Header
        view={view}
        setView={setView}
        onRequestPush={requestPushPermission}
        onToggleHistory={() => { setShowHistory(!showHistory); setShowWorkspaces(false); }}
        onToggleWorkspaces={() => { setShowWorkspaces(!showWorkspaces); setShowHistory(false); }}
        activeWorkspace={activeWorkspace}
        historyCount={trashList.length}
        searchBar={<SearchBar onNavigate={handleSearchNavigate} />}
      />

      <div className={styles.layout}>
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          tasksList={tasksInView}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
        />

        <main className={styles.main}>
          {view === 'dashboard' ? (
            <Dashboard />
          ) : view === 'kanban' ? (
            <>
              <TaskInput addTask={addTask} categories={categories} defaultCategoryId={selectedCategory} />
              <KanbanBoard
                tasksList={filteredTasks}
                editTask={editTask}
                deleteTask={handleDeleteTask}
                reorderTasks={reorderTasks}
                categories={categories}
              />
            </>
          ) : (
            <>
              <TaskInput addTask={addTask} categories={categories} defaultCategoryId={selectedCategory} />
              <TaskList
                tasksList={filteredTasks}
                allCount={allCount}
                activeCount={activeCount}
                completedCount={completedCount}
                filter={filter}
                setFilter={setFilter}
                editTask={editTask}
                deleteTask={handleDeleteTask}
                reorderTasks={reorderTasks}
                loading={loading}
                categories={categories}
              />
            </>
          )}
        </main>
      </div>

      <Footer completedTask={completedTask} incompletedTask={incompletedTask} />

      {/* Panneaux latéraux */}
      {showHistory && (
        <HistoryPanel
          history={history}
          trashList={trashList}
          onRestore={restoreTask}
          onForceDelete={forceDelete}
          onUndo={undoLastAction}
          lastAction={lastAction}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showWorkspaces && (
        <WorkspaceManager
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          setActiveWorkspace={setActiveWorkspace}
          createWorkspace={createWorkspace}
          deleteWorkspace={deleteWorkspace}
          inviteByEmail={inviteByEmail}
          generateInviteLink={generateInviteLink}
          onClose={() => setShowWorkspaces(false)}
        />
      )}
    </div>
  );
};
