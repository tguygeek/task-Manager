import styles from "./header.module.css";
import reactLogo from '../../assets/react.svg';
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <img src={reactLogo} alt="Logo" width={50} height={50} />
        <div>
          <h1>Taskflow</h1>
          <code className="color-gray">Eliminez le chaos suivez le flux</code>
        </div>
      </div>
      <div className={styles.logout}>
        {/* <code className="color-primary">v.1.0</code> */}
        <button onClick={handleLogout}>Déconnexion</button>
      </div>
    </div>
  );
};
