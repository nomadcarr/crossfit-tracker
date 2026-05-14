import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWorkout, getAthletes, addWorkoutResult, deleteWorkoutResult } from '../api';
import Modal from '../components/Modal';
import { getScoreValue, formatScore, scorePlaceholder, scoreLabel } from '../utils/score';
import { useAuth } from '../context/AuthContext';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function WorkoutDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [allAthletes, setAllAthletes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ athlete_id: '', score: '', rx: true, notes: '' });

  const load = () => Promise.all([getWorkout(id), getAthletes()]).then(([w, a]) => {
    setWorkout(w);
    setAllAthletes(a);
  });

  useEffect(() => { load(); }, [id]);

  const athletesWithoutResult = workout
    ? allAthletes.filter(a => !workout.results.find(r => r.athlete_id === a.id))
    : [];

  const myResult = workout?.results.find(r => r.athlete_id === user?.athlete_id);

  const openAdd = () => {
    setForm({ athlete_id: user?.athlete_id ? String(user.athlete_id) : '', score: '', rx: true, notes: '' });
    setErr('');
    setShowAdd(true);
  };

  const submit = async () => {
    if (!form.athlete_id || !form.score.trim()) { setErr('Избери атлет и въведи резултат'); return; }
    const score_value = getScoreValue(form.score, workout.score_type);
    try {
      await addWorkoutResult(id, { ...form, score_value });
      load();
      setShowAdd(false);
    } catch (e) { setErr(e.message); }
  };

  const removeResult = async (rid) => {
    if (!confirm('Изтрий резултата?')) return;
    await deleteWorkoutResult(id, rid);
    load();
  };

  if (!workout) return <div className="loading">Зарежда...</div>;

  const rankClass = (rank) => rank === 1 ? 'r1' : rank === 2 ? 'r2' : rank === 3 ? 'r3' : '';

  return (
    <div className="page">
      <div className="ph">
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>
            <Link to="/workouts">← Тренировки</Link>
          </div>
          <h1>{workout.name}</h1>
          <div className="flex" style={{ marginTop: 6, gap: 10 }}>
            <span className="tag">{workout.type}</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              {new Date(workout.date).toLocaleDateString('bg-BG')}
            </span>
          </div>
          {workout.description && (
            <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {workout.description}
            </div>
          )}
        </div>
        {user ? (
          <button className="btn btn-red" onClick={openAdd}>
            {myResult ? '✏️ Промени резултата' : '+ Добави резултат'}
          </button>
        ) : (
          <Link to="/login" className="btn btn-ghost btn-sm">Влез за да добавиш резултат</Link>
        )}
      </div>

      <div className="card">
        <div className="flex mb16">
          <div className="sec-title" style={{ margin: 0 }}>Класиране</div>
          <div className="spacer" />
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
            {workout.results.length} резултата
          </span>
        </div>

        {workout.results.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🏁</div>
            <p>Няма въведени резултати</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Атлет</th>
                <th>{scoreLabel(workout.score_type)}</th>
                <th>Ниво</th>
                <th>Бележки</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {workout.results.map((r, i) => (
                <tr key={r.id}>
                  <td className={rankClass(r.rank)} style={{ fontSize: '1.1rem', width: 40 }}>
                    {i < 3 ? MEDALS[i] : r.rank}
                  </td>
                  <td>
                    <Link to={`/athletes/${r.athlete_id}`} className="athlete-link" style={{ fontSize: '1rem' }}>
                      {r.athlete_name}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    {formatScore(r.score, workout.score_type)}
                  </td>
                  <td>{r.rx ? <span className="rx">RX</span> : <span className="scaled">Scaled</span>}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{r.notes || '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-xs" onClick={() => removeResult(r.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <Modal title="Добави резултат" onClose={() => setShowAdd(false)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Откажи</button>
            <button className="btn btn-red" onClick={submit}>Запази</button>
          </>
        }>
          {err && <div className="err">{err}</div>}

          <div className="fg">
            <label>Атлет</label>
            {user?.athlete_id ? (
              <div style={{ padding: '10px 13px', background: 'var(--hover)', borderRadius: 8, fontWeight: 700, border: '1px solid var(--border)' }}>
                {user.display_name}
              </div>
            ) : (
              <select className="inp" value={form.athlete_id}
                onChange={e => setForm(f => ({ ...f, athlete_id: e.target.value }))}>
                <option value="">— избери —</option>
                {athletesWithoutResult.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                {workout.results.length > 0 && (
                  <optgroup label="Промени резултат">
                    {workout.results.map(r => <option key={r.athlete_id} value={r.athlete_id}>{r.athlete_name}</option>)}
                  </optgroup>
                )}
              </select>
            )}
          </div>

          <div className="row">
            <div className="fg">
              <label>{scoreLabel(workout.score_type)} *</label>
              <input className="inp" value={form.score}
                onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                placeholder={scorePlaceholder(workout.score_type)} />
            </div>
          </div>

          <div className="fg">
            <div className="toggle-wrap">
              <input type="checkbox" id="rx-check" checked={form.rx}
                onChange={e => setForm(f => ({ ...f, rx: e.target.checked }))} />
              <label htmlFor="rx-check" style={{ textTransform: 'none', fontSize: '0.9rem', color: 'var(--text)', letterSpacing: 0 }}>
                RX (не е Scaled)
              </label>
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
