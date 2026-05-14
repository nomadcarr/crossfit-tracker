import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAthlete, getLifts, addAthleteRecord, deleteAthleteRecord } from '../api';
import Modal from '../components/Modal';
import { formatScore } from '../utils/score';

const CATS = { Olympic: '🏋️ Олимпийски', Squat: '🦵 Клек', Powerlifting: '💪 Powerlifting', Press: '⬆️ Преси', Other: '➕ Друго' };
const today = () => new Date().toISOString().slice(0, 10);

export default function MyDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [lifts, setLifts] = useState([]);
  const [tab, setTab] = useState('workouts');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ lift_id: '', weight_kg: '', date: today(), notes: '' });
  const [err, setErr] = useState('');

  const load = () => {
    if (user?.athlete_id) {
      Promise.all([getAthlete(user.athlete_id), getLifts()]).then(([a, l]) => {
        setAthlete(a); setLifts(l);
      });
    }
  };

  useEffect(() => { load(); }, [user]);

  const submitPR = async () => {
    if (!form.lift_id || !form.weight_kg || !form.date) { setErr('Попълни задължителните полета'); return; }
    try {
      await addAthleteRecord(user.athlete_id, { ...form, weight_kg: parseFloat(form.weight_kg) });
      load();
      setShowAdd(false);
      setForm({ lift_id: '', weight_kg: '', date: today(), notes: '' });
      setErr('');
    } catch (e) { setErr(e.message); }
  };

  const removePR = async (rid) => {
    if (!confirm('Изтрий този запис?')) return;
    await deleteAthleteRecord(user.athlete_id, rid);
    load();
  };

  const handleLogout = async () => {
    await logout();
    nav('/');
  };

  if (!athlete) return <div className="loading">Зарежда...</div>;

  const prsByCategory = athlete.currentPRs.reduce((acc, pr) => {
    const cat = pr.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pr);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h1>👤 {user.display_name}</h1>
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 4 }}>@{user.nickname}</div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>Изход</button>
      </div>

      <div className="g4 mb16">
        <div className="card stat">
          <div className="stat-num">{athlete.workout_count}</div>
          <div className="stat-lbl">Тренировки</div>
        </div>
        <div className="card stat">
          <div className="stat-num">{athlete.currentPRs.length}</div>
          <div className="stat-lbl">Упражнения</div>
        </div>
        <div className="card stat">
          <div className="stat-num">{athlete.pr_count}</div>
          <div className="stat-lbl">Всички записи</div>
        </div>
        <Link to="/workouts" className="card stat" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🏋️</div>
          <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: '0.85rem' }}>Всички тренировки</div>
        </Link>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'workouts' ? 'on' : ''}`} onClick={() => setTab('workouts')}>Мои тренировки</button>
        <button className={`tab ${tab === 'prs' ? 'on' : ''}`} onClick={() => setTab('prs')}>Максимуми</button>
        <button className={`tab ${tab === 'history' ? 'on' : ''}`} onClick={() => setTab('history')}>История</button>
      </div>

      {tab === 'workouts' && (
        <div className="card">
          {athlete.workoutHistory.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🏋️</div>
              <p>Нямаш записани тренировки</p>
              <Link to="/workouts" className="btn btn-red" style={{ marginTop: 12, display: 'inline-flex' }}>
                Виж тренировките →
              </Link>
            </div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Тренировка</th><th>Дата</th><th>Резултат</th><th>Ниво</th></tr></thead>
              <tbody>
                {athlete.workoutHistory.map(r => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/workouts/${r.workout_id}`} style={{ color: 'var(--red)', fontWeight: 700 }}>{r.workout_name}</Link>
                      <div><span className="tag">{r.type}</span></div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{new Date(r.date).toLocaleDateString('bg-BG')}</td>
                    <td style={{ fontWeight: 700 }}>{formatScore(r.score, r.score_type)}</td>
                    <td>{r.rx ? <span className="rx">RX</span> : <span className="scaled">Scaled</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'prs' && (
        <>
          <div className="mb16">
            <button className="btn btn-red" onClick={() => { setShowAdd(true); setErr(''); }}>+ Добави максимум</button>
          </div>
          {Object.keys(CATS).map(cat => {
            const prs = prsByCategory[cat];
            if (!prs?.length) return null;
            return (
              <div className="card mb16" key={cat}>
                <div className="sec-title">{CATS[cat]}</div>
                <table className="tbl">
                  <thead><tr><th>Упражнение</th><th>Макс</th><th>Дата</th></tr></thead>
                  <tbody>
                    {prs.map(pr => (
                      <tr key={pr.lift_id}>
                        <td style={{ fontWeight: 600 }}>{pr.lift_name}</td>
                        <td className="pr-val" style={{ fontSize: '1.1rem' }}>{pr.max_weight} кг</td>
                        <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{new Date(pr.date).toLocaleDateString('bg-BG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
          {athlete.currentPRs.length === 0 && (
            <div className="card empty">
              <div className="empty-icon">🏆</div>
              <p>Нямаш записани максимуми</p>
            </div>
          )}
        </>
      )}

      {tab === 'history' && (
        <div className="card">
          {athlete.prHistory.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div><p>Няма история</p></div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Упражнение</th><th>Тегло</th><th>Дата</th><th>Бележки</th><th></th></tr></thead>
              <tbody>
                {athlete.prHistory.map(r => (
                  <tr key={r.id}>
                    <td><span className="tag">{r.category}</span> {r.lift_name}</td>
                    <td className="pr-val">{r.weight_kg} кг</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{new Date(r.date).toLocaleDateString('bg-BG')}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{r.notes || '—'}</td>
                    <td><button className="btn btn-danger btn-xs" onClick={() => removePR(r.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showAdd && (
        <Modal title="Добави максимум" onClose={() => setShowAdd(false)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Откажи</button>
            <button className="btn btn-red" onClick={submitPR}>Запази</button>
          </>
        }>
          {err && <div className="err">{err}</div>}
          <div className="fg">
            <label>Упражнение *</label>
            <select className="inp" value={form.lift_id} onChange={e => setForm(f => ({ ...f, lift_id: e.target.value }))}>
              <option value="">— избери —</option>
              {Object.keys(CATS).map(cat => {
                const cl = lifts.filter(l => l.category === cat);
                if (!cl.length) return null;
                return <optgroup key={cat} label={CATS[cat]}>{cl.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</optgroup>;
              })}
            </select>
          </div>
          <div className="row">
            <div className="fg">
              <label>Тегло (кг) *</label>
              <input className="inp" type="number" step="0.5" min="0" value={form.weight_kg}
                onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} placeholder="100" />
            </div>
            <div className="fg">
              <label>Дата *</label>
              <input className="inp" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="fg">
            <label>Бележки</label>
            <textarea className="inp" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Необязателно..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
