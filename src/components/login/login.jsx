import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./login.module.css";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users"));
    let user;

    if (users) {
      user = users.find(user => user.email === email && user.password === password);
      if (user) {
        localStorage.setItem("loggedIn", "true");
        navigate("/tasks", {
          state : {
          "userName": user.username,
          "email": user.email,
          "password": user.password,
          "tasksList": user.tasksList }
        });
      }
      else {
      alert("Identifiants incorrects");
      }
    }
    else {
      alert("Erreur dans l'application");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleLogin}>
      <h2>Connexion</h2>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Se connecter</button>

      {/* ✅ Lien vers l'inscription */}
      <p className={styles.switchLink}>
        Vous n'avez pas de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </form>
  );
};
