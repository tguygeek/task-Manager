import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./login.module.css";
import instance from "../axios";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async(e) => {
    e.preventDefault();
    try{
      await instance.get('/sanctum/csrf-cookie');
      const userCredentials = {
        email: email,
        password: password,
      };
      const response = await instance.post('/api/login', userCredentials);
      console.log("✅ Succès Laravel :", response.data);
      alert("Connexion réussie !");
      localStorage.setItem('logedIn' , true);
      // Redirection vers le gestionaire de tache
      navigate("/tasks");
    }
    catch (error) {
      if (error.response) {
        console.log('Erreur Laravel :', error.response.data);
        alert(`Erreur : ${error.response.data.message || "Identifiants invalides"}`);
      } else {
        console.log('Erreur réseau :', error.message);
        alert("Erreur de connexion au serveur");
      }
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
