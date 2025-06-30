// Ce composant est utilise pour afficher le champ de saisi de notre application

import { useState } from 'react';
import styles from './TaskInput.module.css'

export const TaskInput = ({addtask}) => {
    const [taskTitle, setTaskTitle] = useState('');
    const handleInputchange = (e) => {
        // Ici on va gerer la modification de l'input
        setTaskTitle(e.target.value);
    }
    const handleAddTask = (e) => {
        e.preventDefault();
        if(taskTitle.trim()) {
            addtask(taskTitle);
            setTaskTitle(''); 
        }
        else {
            alert('Veuillez entrer un titre de tache');
        }
    }


    return (
        <div className= {`box ${styles.element}` }>
            <h2 className={styles.title}> 🎯 Ajoute ta 1ere tache </h2>
            <form className= {styles.container} onSubmit={handleAddTask}>
                <input 
                    type="text" 
                    className= {styles.input} 
                    placeholder= "Indiquer un titre de tache explicite "
                    value={taskTitle}
                    onChange={handleInputchange}
                />
                <button className="button-primary" type='submit'>
                    Ajouter
                </button>
            </form>
        </div>
    );
};