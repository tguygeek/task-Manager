import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../hooks/useWorkspace';
import styles from './InvitePage.module.css';

export const InvitePage = () => {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const { acceptInvitation } = useWorkspace();
  const [status, setStatus]  = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const accept = async () => {
      const result = await acceptInvitation(token);
      if (result?.success) {
        setStatus('success');
        setMessage(result.message);
        setTimeout(() => navigate('/tasks'), 2500);
      } else {
        setStatus('error');
        setMessage("Invitation invalide ou expirée.");
      }
    };
    accept();
  }, [token]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>
          {status === 'loading' ? '⏳' : status === 'success' ? '✅' : '❌'}
        </div>
        <h2 className={styles.title}>
          {status === 'loading' ? "Traitement de l'invitation..."
           : status === 'success' ? "Bienvenue !"
           : "Invitation invalide"}
        </h2>
        <p className={styles.message}>
          {status === 'loading' ? "Veuillez patienter..."
           : status === 'success' ? `${message} Redirection en cours...`
           : message}
        </p>
        {status !== 'loading' && (
          <button className={styles.btn} onClick={() => navigate('/tasks')}>
            Aller sur Taskflow →
          </button>
        )}
      </div>
    </div>
  );
};
