// Ce composnt est utilise pour afficher la liste de tache

import { Taskitem } from '../taskItem/taskItem';
import styles from './TaskList.module.css'

export const TaskList = ({ tasksList , editTask, deleteTask, incompletedTask }) => {
    const  taskList = tasksList.map((task) => (
                        <Taskitem 
                            key={task.id}
                            task={task}
                            editTask={editTask}
                            deleteTask={deleteTask}
                        />
    ));

    if(tasksList && tasksList.length > 0) {
        return (
            <div className="box">
                <h2 className= {styles.title}>
                    {incompletedTask > 0 &&
                        (<>📄 il te reste encore {incompletedTask} taches a effectuer !</>) 
                    }
                {incompletedTask === 0 &&
                        (<>🎉 tu as termine toutes tes taches !</>) }
                </h2>
                {tasksList && tasksList.length > 0 && (
                    <ul className= {styles.container}>
                        {taskList}
                    </ul>
                )}

            </div>
        );
    }
    return (
        <div className="box">
            <h2 className={styles.emptyState}>
                👋 salut tu n'as rien a faire profite de ton temps libre !
            </h2>
        </div>
    );

};