import { useEffect, useState } from "react";
import { Footer } from "./components/footer/footer";
import { Header } from "./components/header/Header";
import { TaskInput } from "./components/taskInput/taskInput";
import { TaskList } from "./components/tasklist/taskList";
import { useLocation } from "react-router-dom";
import instance  from "./components/axios";

export const TaskContainer = () => {
  const location = useLocation();
  const currentUser = location.state || {};
  const [user, setUser] = useState(null);
  const [tasksList, setTasksList] = useState([]);
  

  

  //const [tasksList, setTasksList] = useState(currentUser.tasksList || []);



  const getUser = async() => {
    try {
      const token = localStorage.getItem('access_token'); // récupère le token stocké
      
      const response = await instance.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` } // en-tête d’authentification
      });

      // traiter la réponse
      console.log(response.data.user);
      setUser(response.data.user); // retourne l'utilisateur récupéré
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // gérer l’erreur 401 (par exemple redirection vers login)
        console.error('Non autorisé - Veuillez vous authentifier');
      } else {
        // autres erreurs
        console.error('Erreur lors de la requête', error);
      }
    }
  }

  
  const getUserTasks = async() => {
    try {
      const response = await instance.get('/api/user/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setTasksList(response.data.tasks);
      //saveTasksToLocalStorage(response.data.tasks);
      console.log("Tâches récupérées avec succès:", response.data.tasks);

    }
    catch (error) {
      if(error.response) {
        console.error('Erreur lors de la récupération des tâches:', error.response.data);
      }
      else {
        console.error('Erreur réseau:', error.message);
      }
    }
  };

  useEffect(() => {

    getUser()
    getUserTasks();
    

  }, []);

  // const saveTasksToLocalStorage = (tasks) => {
  //   const users = getUser();
  //   const updatedUsers = users.map((user) =>
  //     user.email === currentUser.email && user.password === currentUser.password
  //       ? { ...user, tasksList: tasks }
  //       : user
  //   );
  //   localStorage.setItem("users", JSON.stringify(updatedUsers));
  // };

  const addtask = async (title) => {
    const token = localStorage.getItem('access_token'); // Récupère le token

    if (!token) {
      console.error("Aucun token trouvé. L'utilisateur n'est peut-être pas connecté.");
      return;
    }

    const newTask = {
      title: title,
      completed: false,
      description: '',
    };

    try {
      const response = await instance.post('/api/tasks', newTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        alert(response.data.message);
        getUserTasks(); // Recharge la liste des tâches
      } else {
        console.error("Erreur lors de l'ajout de la nouvelle tâche");
      }
    } catch (error) {
      console.error("Erreur HTTP :", error.response?.status, error.response?.data || error.message);
    }
};


  const editTask = async(id, completedValue) => {
      const token = localStorage.getItem('access_token'); // Récupère le token

      if (!token) {
        console.error("Aucun token trouvé. L'utilisateur n'est peut-être pas connecté.");
        return;
      }
    
     try {
      const response = await instance.post('/api/tasks/edit', {'id' : id, 'completed' : completedValue}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        alert(response.data.message);
        getUserTasks(); // Recharge la liste des tâches
      } else {
        console.error("Erreur lors de l'ajout de la nouvelle tâche");
      }
    } catch (error) {
      console.error("Erreur HTTP :", error.response?.status, error.response?.data || error.message);
    }
  };

  const deleteTask = async(id) => {
    const token = localStorage.getItem('access_token'); // Récupère le token
    if (!token) {
      console.error("Aucun token trouvé. L'utilisateur n'est peut-être pas connecté.");
      return;
    }
    try {
      const response = await instance.delete('/api/tasks/delete', {
        headers: {  Authorization: `Bearer ${token}` },
        data: { id: id } // Envoie l'ID de la tâche à supprimer
      });
      if (response.data.success) {
        alert(response.data.message);
        getUserTasks(); // Recharge la liste des tâches
      } else {
        console.error("Erreur lors de la suppression de la tâche");
      }
    } catch (error) {
      console.error("Erreur HTTP :", error.response?.status, error.response?.data || error.message);
    }
    // const updatedTasks = tasksList.filter((task) => task.id !== id);
    // setTasksList(updatedTasks);
   // saveTasksToLocalStorage(updatedTasks);
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
