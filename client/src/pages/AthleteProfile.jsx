import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAthlete, getLifts, addAthleteRecord, deleteAthleteRecord, deleteAthlete } from '../api';
import Modal from '../components/Modal';
import { formatScore } from '../utils/score';
import { useAuth } from '../context/AuthContext';

const CATS = { Olympic: '🏋️ Олимпийски', Squat: '🦵 Клек', Powerlifting: '💪 Powerlifting', Press: '⬆️ Преси', Other: '➕ Друго' };

export default function AthleteProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.athlete_id === Number(id);
  const [athlete, setAthlete] = useState(null);
  const [lifts, setLifts] = useState([]);
  const [tab, setTab] = useState('prs');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ lift_id: '', weight_kg: '', date: today(), notes: '' });
  const [err, setErr] = useState('');

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  const load = () => Promise.all([getAthlete(id), getLifts()]).then(([a, l]) => {
    setAthlete(a);
    setLifts(l);
  });

  useEffect(() => { load(); }, [id]);

  const submitPR = async () => {
    if (!form.lift_id || !form.weight_kg || !form.date) { setErr('Попълни всички задължителни полета'); return; }
    try {
      await addAthleteRecord(id, { ...form, weight_kg: parseFloat(form.weight_kg) });
      load();
      setShowAdd(false);
      setForm({ lift_id: '', weight_kg: '', date: today(), notes: '' });
      setErr('');
    } catch (e) { setErr(e.message); }
  };

  const removePR = async (rid) => {
    if (!confirm('Изтрий този запис?')) return;
    await deleteAthleteRecord(id, rid);
    load();
  };

  const removeAthlete = async () => {
    if (!confirm(`Изтрий ${athlete.name}? Всички данни ще бъдат изтрити.`)) return;
    await deleteAthlete(id);
    nav('/athletes');
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
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>
            <Link to="/athletes">← Атлети</Link>
          </div>
          <h1>{athlete.name}</h1>
          <div className="flex" style={{ marginTop: 6, color: 'var(--muted)', fontSize: '0.85rem', gap: 16 }}>
            <span>🏋️ {athlete.workout_count} тренировки</span>
            <span>🏆 {athlete.pr_count} рекорда</span>
          </div>
        </div>
        {isOwner && <button className="btn btn-danger btn-sm" onClick={removeAthlete}>Изтрий атлет</button>}
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'prs' ? 'on' : ''}`} onClick={() => setTab('prs')}>Максимуми</button>
        <button className={`tab ${tab === 'history' ? 'on' : ''}`} onClick={() => setTab('history')}>История на рекордите</button>
        <button className={`tab ${tab === 'workouts' ? 'on' : ''}`} onClick={() => setTab('workouts')}>Тренировки</button>
      </div>

      {tab === 'prs' && (
        <>
          {isOwner && (
            <div className="mb16">
              <button className="btn btn-red" onClick={() => { setShowAdd(true); setErr(''); }}>+ Добави резултат</button>
            </div>
          )}
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
                        <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                          {new Date(pr.date).toLocaleDateString('bg-BG')}
                        </td>
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
              <p>Няма въведени резултати</p>
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
              <thead><tr><th>Упражнение</th><th>Тегло</th><th>Дата</th><th>Бележки</th>{isOwner && <th></th>}</tr></thead>
              <tbody>
                {athlete.prHistory.map(r => (
                  <tr key={r.id}>
                    <td><span className="tag">{r.category}</span> {r.lift_name}</td>
                    <td className="pr-val">{r.weight_kg} кг</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{new Date(r.date).toLocaleDateString('bg-BG')}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{r.notes || '—'}</td>
                    {isOwner && (
                      <td>
                        <button className="btn btn-danger btn-xs" onClick={() => removePR(r.id)}>✕</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'workouts' && (
        <div className="card">
          {athlete.workoutHistory.length === 0 ? (
            <div className="empty"><div className="empty-icon">🏋️</div><p>Няма тренировки</p></div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Тренировка</th><th>Дата</th><th>Резултат</th><th>Ниво</th><th>Бележки</th></tr></thead>
              <tbody>
                {athlete.workoutHistory.map(r => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/workouts/${r.workout_id}`} style={{ color: 'var(--red)', fontWeight: 700 }}>
                        {r.workout_name}
                      </Link>
                      <div><span className="tag">{r.type}</span></div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{new Date(r.date).toLocaleDateString('bg-BG')}</td>
                    <td style={{ fontWeight: 700 }}>{formatScore(r.score, r.score_type)}</td>
                    <td>{r.rx ? <span className="rx">RX</span> : <span className="scaled">Scaled</span>}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showAdd && (
        <Modal title="Добави резултат" onClose={() => setShowAdd(false)} footer={
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
                const catLifts = lifts.filter(l => l.category === cat);
                if (!catLifts.length) return null;
                return (
                  <optgroup key={cat} label={CATS[cat]}>
                    {catLifts.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </optgroup>
                );
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
