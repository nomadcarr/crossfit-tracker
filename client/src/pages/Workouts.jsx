import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorkouts, createWorkout, deleteWorkout } from '../api';
import Modal from '../components/Modal';

const TYPES = ['For Time', 'AMRAP', 'EMOM', 'For Reps', 'Max Weight', 'Custom'];
const SCORE_TYPES = [
  { value: 'time', label: 'Време (по-малко = по-добре)' },
  { value: 'rounds_reps', label: 'Кръгове + Репове (повече = по-добре)' },
  { value: 'reps', label: 'Репове (повече = по-добре)' },
  { value: 'weight', label: 'Тегло кг (повече = по-добре)' },
];

const defaultScoreType = (type) => {
  if (type === 'For Time') return 'time';
  if (type === 'AMRAP') return 'rounds_reps';
  if (type === 'For Reps') return 'reps';
  if (type === 'Max Weight') return 'weight';
  return 'reps';
};

const today = () => new Date().toISOString().slice(0, 10);

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', description: '', type: 'For Time', score_type: 'time', date: today() });

  const load = () => getWorkouts().then(setWorkouts).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm({ name: '', description: '', type: 'For Time', score_type: 'time', date: today() });
    setErr('');
    setShowAdd(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.date) { setErr('Попълни името и датата'); return; }
    try {
      await createWorkout(form);
      load();
      setShowAdd(false);
    } catch (e) { setErr(e.message); }
  };

  const remove = async (w) => {
    if (!confirm(`Изтрий "${w.name}"? Всички резултати ще бъдат изтрити.`)) return;
    await deleteWorkout(w.id);
    load();
  };

  return (
    <div className="page">
      <div className="ph">
        <h1>Тренировки</h1>
        <button className="btn btn-red" onClick={openAdd}>+ Нова тренировка</button>
      </div>

      {loading ? <div className="loading">Зарежда...</div> : workouts.length === 0 ? (
        <div className="card empty">
          <div className="empty-icon">🏋️</div>
          <p>Няма добавени тренировки</p>
        </div>
      ) : (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Тренировка</th>
                <th>Тип</th>
                <th>Дата</th>
                <th>Резултати</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {workouts.map(w => (
                <tr key={w.id}>
                  <td>
                    <Link to={`/workouts/${w.id}`} style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem' }}>
                      {w.name}
                    </Link>
                    {w.description && (
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: 2 }}>
                        {w.description.slice(0, 60)}{w.description.length > 60 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td><span className="tag">{w.type}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {new Date(w.date).toLocaleDateString('bg-BG')}
                  </td>
                  <td style={{ fontWeight: 700 }}>{w.result_count}</td>
                  <td>
                    <div className="flex" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/workouts/${w.id}`} className="btn btn-ghost btn-xs">Виж</Link>
                      <button className="btn btn-danger btn-xs" onClick={() => remove(w)}>Изтрий</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal title="Нова тренировка" onClose={() => setShowAdd(false)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Откажи</button>
            <button className="btn btn-red" onClick={submit}>Запази</button>
          </>
        }>
          {err && <div className="err">{err}</div>}
          <div className="fg">
            <label>Название *</label>
            <input className="inp" value={form.name} onChange={e => setField('name', e.target.value)}
              placeholder="напр. Fran, 21-15-9..." autoFocus />
          </div>
          <div className="fg">
            <label>Описание</label>
            <textarea className="inp" value={form.description} onChange={e => setField('description', e.target.value)}
              placeholder="21-15-9 Thrusters 43кг / Pull-ups..." />
          </div>
          <div className="row">
            <div className="fg">
              <label>Тип тренировка</label>
              <select className="inp" value={form.type} onChange={e => {
                const t = e.target.value;
                setForm(f => ({ ...f, type: t, score_type: defaultScoreType(t) }));
              }}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Дата *</label>
              <input className="inp" type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
            </div>
          </div>
          <div className="fg">
            <label>Тип резултат</label>
            <select className="inp" value={form.score_type} onChange={e => setField('score_type', e.target.value)}>
              {SCORE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
