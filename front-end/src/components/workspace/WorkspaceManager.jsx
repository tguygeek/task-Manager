import { useState } from 'react';
import styles from './WorkspaceManager.module.css';
import toast from 'react-hot-toast';

const ICONS    = ['📁','💼','🚀','🎯','💡','🎨','🏋️','🌍','🔬','📱','🎮','🏆'];
const COLORS   = ['#6366f1','#3b82f6','#10b981','#ef4444','#f59e0b','#8b5cf6','#ec4899','#14b8a6'];

export const WorkspaceManager = ({
  workspaces, activeWorkspace, setActiveWorkspace,
  createWorkspace, deleteWorkspace, inviteByEmail, generateInviteLink, onClose,
}) => {
  const [view, setView]           = useState('list');   // 'list' | 'create' | 'manage'
  const [selectedWs, setSelectedWs] = useState(null);
  const [name, setName]           = useState('');
  const [desc, setDesc]           = useState('');
  const [icon, setIcon]           = useState('📁');
  const [color, setColor]         = useState('#6366f1');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink]   = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = await createWorkspace({ name, description: desc, icon, color });
    if (result?.success) {
      setView('list');
      setName(''); setDesc(''); setIcon('📁'); setColor('#6366f1');
    }
  };

  const handleInviteEmail = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const result = await inviteByEmail(selectedWs.id, inviteEmail);
    if (result?.success) setInviteEmail('');
  };

  const handleGenerateLink = async () => {
    const result = await generateInviteLink(selectedWs.id);
    if (result?.success) {
      setInviteLink(result.link);
      await navigator.clipboard.writeText(result.link);
      toast.success('Lien copié dans le presse-papiers !');
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          {view === 'list'   ? '🗂️ Workspaces' :
           view === 'create' ? '➕ Nouveau workspace' : `⚙️ ${selectedWs?.name}`}
        </span>
        <div className={styles.headerActions}>
          {view !== 'list' && (
            <button className={styles.backBtn} onClick={() => setView('list')}>← Retour</button>
          )}
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
      </div>

      <div className={styles.body}>
        {/* ── Vue liste ── */}
        {view === 'list' && (
          <>
            {/* Option "Personnel" */}
            <button
              className={`${styles.wsItem} ${activeWorkspace === null ? styles.wsActive : ''}`}
              onClick={() => { setActiveWorkspace(null); onClose(); }}
            >
              <span className={styles.wsIcon}>👤</span>
              <span className={styles.wsName}>Personnel</span>
              <span className={styles.wsRole}>Par défaut</span>
            </button>

            {workspaces.map(ws => (
              <div key={ws.id} className={styles.wsRow}>
                <button
                  className={`${styles.wsItem} ${activeWorkspace?.id === ws.id ? styles.wsActive : ''}`}
                  style={activeWorkspace?.id === ws.id ? { borderLeftColor: ws.color } : {}}
                  onClick={() => { setActiveWorkspace(ws); onClose(); }}
                >
                  <span className={styles.wsIcon}>{ws.icon}</span>
                  <div className={styles.wsInfo}>
                    <span className={styles.wsName}>{ws.name}</span>
                    <span className={styles.wsMeta}>{ws.members_count} membre{ws.members_count > 1 ? 's' : ''}</span>
                  </div>
                  <span className={styles.wsRole} style={{ color: ws.role === 'owner' ? '#f59e0b' : '#888' }}>
                    {ws.role}
                  </span>
                </button>
                {ws.role === 'owner' && (
                  <div className={styles.wsActions}>
                    <button className={styles.manageBtn}
                      onClick={() => { setSelectedWs(ws); setView('manage'); }}
                      title="Gérer"
                    >⚙️</button>
                    <button className={styles.deleteBtn}
                      onClick={() => { if (window.confirm('Supprimer ce workspace ?')) deleteWorkspace(ws.id); }}
                      title="Supprimer"
                    >🗑️</button>
                  </div>
                )}
              </div>
            ))}

            <button className={styles.createBtn} onClick={() => setView('create')}>
              + Nouveau workspace
            </button>
          </>
        )}

        {/* ── Créer un workspace ── */}
        {view === 'create' && (
          <form className={styles.form} onSubmit={handleCreate}>
            <input className={styles.input} value={name} onChange={e => setName(e.target.value)}
              placeholder="Nom du workspace" required autoFocus />
            <input className={styles.input} value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Description (optionnel)" />

            <label className={styles.fieldLabel}>Icône</label>
            <div className={styles.iconGrid}>
              {ICONS.map(i => (
                <button key={i} type="button"
                  className={`${styles.iconBtn} ${icon === i ? styles.iconActive : ''}`}
                  onClick={() => setIcon(i)}>{i}</button>
              ))}
            </div>

            <label className={styles.fieldLabel}>Couleur</label>
            <div className={styles.colorGrid}>
              {COLORS.map(c => (
                <button key={c} type="button"
                  className={`${styles.colorDot} ${color === c ? styles.colorActive : ''}`}
                  style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>

            {/* Aperçu */}
            <div className={styles.preview} style={{ borderColor: color, background: `${color}11` }}>
              <span style={{ fontSize: '1.5rem' }}>{icon}</span>
              <div>
                <div style={{ color: '#fff', fontWeight: 600 }}>{name || 'Nom du workspace'}</div>
                <div style={{ color: '#888', fontSize: '0.8rem' }}>{desc || 'Description'}</div>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>Créer le workspace</button>
          </form>
        )}

        {/* ── Gérer un workspace ── */}
        {view === 'manage' && selectedWs && (
          <div className={styles.manageView}>
            {/* Inviter par email */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>📧 Inviter par email</div>
              <form className={styles.inviteForm} onSubmit={handleInviteEmail}>
                <input className={styles.input} type="email" value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="email@exemple.com" />
                <button type="submit" className={styles.inviteBtn}>Inviter</button>
              </form>
            </div>

            {/* Inviter par lien */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>🔗 Lien d'invitation</div>
              <button className={styles.linkBtn} onClick={handleGenerateLink}>
                Générer & copier le lien
              </button>
              {inviteLink && (
                <div className={styles.linkBox}>{inviteLink}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
