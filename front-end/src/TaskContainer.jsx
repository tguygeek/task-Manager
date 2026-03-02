import { useState } from "react";
import { Footer } from "./components/footer/footer";
import { Header } from "./components/header/Header";
import { TaskInput } from "./components/taskInput/taskInput";
import { TaskList } from "./components/tasklist/taskList";
import { useTasks } from "./hooks/useTasks";

export const TaskContainer = () => {
  const { tasksList, loading, addTask, editTask, deleteTask, getTasksCount } = useTasks();
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  const filteredTasks = tasksList.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const { completedTask, incompletedTask } = getTasksCount();

  return (
    <main>
      <Header />
      <TaskInput addTask={addTask} />
      <TaskList
        tasksList={filteredTasks}
        allCount={tasksList.length}
        activeCount={incompletedTask}
        completedCount={completedTask}
        filter={filter}
        setFilter={setFilter}
        editTask={editTask}
        deleteTask={deleteTask}
        loading={loading}
      />
      <Footer completedTask={completedTask} incompletedTask={incompletedTask} />
    </main>
  );
};