import styles from './Footer.module.css'; 

export const Footer = ({completedTask}) => {
    if(completedTask){
        return (
                <footer>
                    <code className= {styles.footer}>
                        Avec Tasklow tu as elimine {completedTask} Tache
                        {completedTask > 1 ? 's' : ''} de ta liste des taches
                    </code>
                </footer>
            );
    }
    return null;
}