import { useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';
import styles from './Dashboard.module.css';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className={styles.statCard} style={{ borderTopColor: color }}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statValue} style={{ color }}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
    {sub && <div className={styles.statSub}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value} tâche{payload[0].value > 1 ? 's' : ''}</p>
    </div>
  );
};

export const Dashboard = () => {
  const { stats, loading, refresh } = useDashboard();

  useEffect(() => { refresh(); }, []);

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <span>Chargement du dashboard...</span>
    </div>
  );

  if (!stats) return <div className={styles.error}>Impossible de charger les statistiques.</div>;

  const pieData = stats.byCategory
    .filter(c => c.total > 0)
    .map(c => ({ name: `${c.icon} ${c.name}`, value: c.total, color: c.color }));

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.title}>📊 Dashboard</h2>
        <p className={styles.subtitle}>Vue d'ensemble de ta productivité</p>
      </div>

      {/* Stat cards */}
      <div className={styles.statGrid}>
        <StatCard icon="🎯" label="Taux de complétion" value={`${stats.rate}%`}
          sub={`${stats.completed}/${stats.total} tâches`} color="#10b981" />
        <StatCard icon="⚡" label="En cours" value={stats.active}
          sub="tâches actives" color="#f59e0b" />
        <StatCard icon="✅" label="Terminées" value={stats.completed}
          sub="tâches complétées" color="#3b82f6" />
        <StatCard icon="🔥" label="Streak" value={`${stats.streak}j`}
          sub={stats.streak > 0 ? "jours consécutifs actifs" : "Commence aujourd'hui !"} color="#e74c3c" />
      </div>

      {/* Graphiques */}
      <div className={styles.charts}>
        {/* Tâches complétées par jour */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>📈 Tâches complétées — 7 derniers jours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e74c3c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#e74c3c" strokeWidth={2}
                fill="url(#colorCount)" dot={{ fill: '#e74c3c', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par catégorie */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>🏷️ Répartition par catégorie</h3>
          {pieData.length === 0 ? (
            <div className={styles.emptyChart}>Aucune tâche avec catégorie</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(value) => <span style={{ color: '#aaa', fontSize: '0.78rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Détail par catégorie */}
      {stats.byCategory.length > 0 && (
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>📂 Détail par catégorie</h3>
          <div className={styles.categoryList}>
            {stats.byCategory.map((cat, i) => {
              const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
              return (
                <div key={i} className={styles.catRow}>
                  <span className={styles.catName}>{cat.icon} {cat.name}</span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill}
                      style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                  <span className={styles.catStats} style={{ color: cat.color }}>
                    {cat.completed}/{cat.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
