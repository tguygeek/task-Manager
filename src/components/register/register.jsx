import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./register.module.css";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const users = getUsers();
    const newUser = {
          "userName": username,
          "email": email,
          "password": password,
          "tasksList": [] 
        };
    let user;
    if(users){
      user = users.filter((user) => {user.email === email});
      if (user.length > 0) {
        alert("Un compte a deja ete creer avec cet EMAIL veiller choisir une autre adresse mail ou vous connecter si vous avait deja un compte");
      }
      else{
        const newUsersList = [...users, newUser];
        localStorage.setItem("users",JSON.stringify(newUsersList));
        navigate("/login");
      }
    }
    else{
        localStorage.setItem("users", JSON.stringify([newUser]));
        navigate("/login");
    }
  };

  const getUsers = () => {
    return JSON.parse(localStorage.getItem("users"));
  }

  return (
    <form className={styles.form} onSubmit={handleRegister}>
      <h2>Inscription</h2>
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        onChange={(e) => setUsername(e.target.value)}
        required
      />
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
      <button type="submit">S'inscrire</button>

      {/* ✅ Lien vers la connexion */}
      <p className={styles.switchLink}>
        Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </form>
  );
};
