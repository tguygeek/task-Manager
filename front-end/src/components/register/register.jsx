import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./register.module.css";
import axios from "../axios";
import instance from "../axios";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();


 const handleRegister = async (e) => {
  e.preventDefault();
  
  try {
    // 1. Récupérer le cookie CSRF
    await axios.get('/sanctum/csrf-cookie');

    // 2. Envoyer la requête d'inscription
    const newUser = {
      name: username,
      email: email,
      password: password,
    };

    const response = await axios.post('/api/register', newUser);
    
    // 3. Si succès
    console.log("✅ Succès Laravel :", response.data);
    alert("Inscription réussie !");
    // 5. Redirection vers /login 
    navigate("/login");
    
  } catch (error) {
    // 4. Gestion des erreurs
    if (error.response) {
      console.log('Erreur Laravel :', error.response.data);
      alert(`Erreur : ${error.response.data.message || "Données invalides"}`);
    } else {
      console.log('Erreur réseau :', error.message);
      alert("Erreur de connexion au serveur");
    }
    
  }
};

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
