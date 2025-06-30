import { useEffect, useState } from "react";
import { Footer } from "./components/footer/footer";
import { Header } from "./components/header/Header";
import { TaskInput } from "./components/taskInput/taskInput";
import { TaskList } from "./components/tasklist/taskList";
import { useLocation } from "react-router-dom";

export const TaskContainer = () => {
  const location = useLocation();
  const currentUser = location.state || {};

  const [tasksList, setTasksList] = useState(currentUser.tasksList || []);

  const getUsers = () => {
    return JSON.parse(localStorage.getItem("users")) || [];
  };

  const saveTasksToLocalStorage = (tasks) => {
    const users = getUsers();
    const updatedUsers = users.map((user) =>
      user.email === currentUser.email && user.password === currentUser.password
        ? { ...user, tasksList: tasks }
        : user
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const addtask = (title) => {
    const newTask = {
      id: tasksList.length ? tasksList[tasksList.length - 1].id + 1 : 1,
      title: title,
      completed: false,
    };

    const updatedTasks = [...tasksList, newTask];
    setTasksList(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  const editTask = (id, completedValue) => {
    const updatedTasks = tasksList.map((task) =>
      task.id === id ? { ...task, completed: completedValue } : task
    );
    setTasksList(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasksList.filter((task) => task.id !== id);
    setTasksList(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  const getTasksCount = () => {
    const completedTask = tasksList.filter((task) => task.completed).length;
    const incompletedTask = tasksList.length - completedTask;
    return {
      completedTask,
      incompletedTask,
    };
  };

  const { completedTask, incompletedTask } = getTasksCount();

  return (
    <main>
      <Header />
      <TaskInput addtask={addtask} />
      <TaskList
        tasksList={tasksList}
        editTask={editTask}
        deleteTask={deleteTask}
        incompletedTask={incompletedTask}
      />
      <Footer completedTask={completedTask} />
    </main>
  );
};

// echo "# task-Manager" >> README.md
// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/tguygeek/task-Manager.git
// git push -u origin main
