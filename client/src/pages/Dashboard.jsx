import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getStats().then(setStats).catch(() => setErr('Грешка при зареждане'));
  }, []);

  if (err) return <div className="page"><div className="err">{err}</div></div>;
  if (!stats) return <div className="loading">Зарежда...</div>;

  return (
    <div className="page">
      <div className="ph"><h1>Dashboard</h1></div>

      <div className="g4 mb16">
        <Link to="/athletes" className="card stat stat-link">
          <div className="stat-num">{stats.athletes}</div>
          <div className="stat-lbl">Атлети</div>
        </Link>
        <Link to="/workouts" className="card stat stat-link">
          <div className="stat-num">{stats.workouts}</div>
          <div className="stat-lbl">Тренировки</div>
        </Link>
        <Link to="/workouts" className="card stat stat-link">
          <div className="stat-num">{stats.results}</div>
          <div className="stat-lbl">Резултати</div>
        </Link>
        <Link to="/prs" className="card stat stat-link">
          <div className="stat-num">{stats.prs}</div>
          <div className="stat-lbl">Лични рекорди</div>
        </Link>
      </div>

      <div className="g2">
        <div className="card">
          <div className="sec-title">Последни тренировки</div>
          {stats.recentWorkouts.length === 0 ? (
            <div className="empty" style={{ padding: 20 }}>Няма тренировки</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Тренировка</th>
                  <th>Дата</th>
                  <th>Резултати</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentWorkouts.map(w => (
                  <tr key={w.id}>
                    <td>
                      <Link to={`/workouts/${w.id}`} style={{ color: 'var(--red)', fontWeight: 700 }}>
                        {w.name}
                      </Link>
                      <div><span className="tag">{w.type}</span></div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {new Date(w.date).toLocaleDateString('bg-BG')}
                    </td>
                    <td style={{ fontWeight: 700 }}>{w.result_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ marginTop: 12 }}>
            <Link to="/workouts" className="btn btn-ghost btn-sm">Всички тренировки →</Link>
          </div>
        </div>

        <div className="card">
          <div className="sec-title">Последни рекорди</div>
          {stats.recentPRs.length === 0 ? (
            <div className="empty" style={{ padding: 20 }}>Няма рекорди</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Атлет</th>
                  <th>Упражнение</th>
                  <th>Кг</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPRs.map(r => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/athletes/${r.athlete_id}`} className="athlete-link">
                        {r.athlete_name}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{r.lift_name}</td>
                    <td className="pr-val">{r.weight_kg} кг</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ marginTop: 12 }}>
            <Link to="/prs" className="btn btn-ghost btn-sm">Всички максимуми →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
