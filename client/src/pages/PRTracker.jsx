import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLifts, getLiftLeaderboard, createLift, deleteLift, addAthleteRecord } from '../api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const CATS = { Olympic: '🏋️ Олимпийски', Squat: '🦵 Клек', Powerlifting: '💪 Powerlifting', Press: '⬆️ Преси', Other: '➕ Друго' };
const MEDALS = ['🥇', '🥈', '🥉'];
const today = () => new Date().toISOString().slice(0, 10);

export default function PRTracker() {
  const { user } = useAuth();
  const [lifts, setLifts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [board, setBoard] = useState(null);
  const [showAddLift, setShowAddLift] = useState(false);
  const [newLift, setNewLift] = useState({ name: '', category: 'Olympic' });
  const [showAddResult, setShowAddResult] = useState(false);
  const [resultForm, setResultForm] = useState({ weight_kg: '', date: today(), notes: '' });
  const [err, setErr] = useState('');
  const [resultErr, setResultErr] = useState('');

  const loadLifts = () => getLifts().then(l => {
    setLifts(l);
    if (!selected && l.length > 0) setSelected(l[0]);
  });

  useEffect(() => { loadLifts(); }, []);

  useEffect(() => {
    if (!selected) return;
    setBoard(null);
    getLiftLeaderboard(selected.id).then(setBoard);
  }, [selected]);

  const addLift = async () => {
    if (!newLift.name.trim()) { setErr('Въведи название'); return; }
    try {
      const created = await createLift(newLift);
      await loadLifts();
      setSelected(created);
      setShowAddLift(false);
      setNewLift({ name: '', category: 'Olympic' });
      setErr('');
    } catch (e) { setErr(e.message); }
  };

  const removeLift = async (lift) => {
    if (!confirm(`Изтрий "${lift.name}"?`)) return;
    try {
      await deleteLift(lift.id);
      loadLifts();
      setSelected(null);
      setBoard(null);
    } catch (e) { alert(e.message); }
  };

  const openAddResult = () => {
    setResultForm({ weight_kg: '', date: today(), notes: '' });
    setResultErr('');
    setShowAddResult(true);
  };

  const submitResult = async () => {
    if (!resultForm.weight_kg || !resultForm.date) { setResultErr('Попълни тегло и дата'); return; }
    try {
      await addAthleteRecord(user.athlete_id, { ...resultForm, lift_id: selected.id, weight_kg: parseFloat(resultForm.weight_kg) });
      setShowAddResult(false);
      getLiftLeaderboard(selected.id).then(setBoard);
    } catch (e) { setResultErr(e.message); }
  };

  const liftsByCategory = lifts.reduce((acc, l) => {
    const cat = l.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(l);
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="ph">
        <h1>Максимуми</h1>
        <button className="btn btn-red" onClick={() => { setShowAddLift(true); setErr(''); }}>+ Ново упражнение</button>
      </div>

      <div className="pr-layout">
        {/* Sidebar */}
        <div>
          {Object.keys(CATS).map(cat => {
            const catLifts = liftsByCategory[cat];
            if (!catLifts?.length) return null;
            return (
              <div key={cat} className="card" style={{ padding: '12px 0', marginBottom: 10 }}>
                <div style={{ padding: '0 14px 8px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                  {CATS[cat]}
                </div>
                {catLifts.map(l => (
                  <div key={l.id}
                    onClick={() => setSelected(l)}
                    style={{
                      padding: '8px 14px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: selected?.id === l.id ? 'var(--red)' : 'var(--text)',
                      background: selected?.id === l.id ? 'rgba(232,41,28,.1)' : 'transparent',
                      borderLeft: selected?.id === l.id ? '2px solid var(--red)' : '2px solid transparent',
                      transition: 'all .1s',
                    }}>
                    {l.name}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Leaderboard */}
        <div>
          {!selected ? (
            <div className="card empty">
              <div className="empty-icon">🏆</div>
              <p>Избери упражнение</p>
            </div>
          ) : !board ? (
            <div className="loading">Зарежда...</div>
          ) : (
            <div className="card">
              <div className="flex mb16">
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{board.lift.name}</h2>
                  <span className="tag">{CATS[board.lift.category] || board.lift.category}</span>
                </div>
                <div className="spacer" />
                {user ? (
                  <button className="btn btn-red btn-sm" onClick={openAddResult}>+ Добави резултат</button>
                ) : (
                  <Link to="/login" className="btn btn-ghost btn-sm">Влез за да добавиш резултат</Link>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => removeLift(board.lift)}>Изтрий</button>
              </div>

              {board.records.length === 0 ? (
                <div className="empty" style={{ padding: 30 }}>
                  <div className="empty-icon">🏆</div>
                  <p>Няма резултати за това упражнение</p>
                  <p style={{ fontSize: '0.85rem', marginTop: 6 }}>
                    {user ? 'Добави първия резултат по-горе' : 'Влез за да добавиш резултат'}
                  </p>
                </div>
              ) : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Атлет</th>
                      <th>Макс тегло</th>
                      <th>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {board.records.map((r, i) => (
                      <tr key={r.athlete_id}>
                        <td style={{ width: 40, fontSize: '1.1rem' }}>
                          {i < 3 ? MEDALS[i] : r.rank}
                        </td>
                        <td>
                          <Link to={`/athletes/${r.athlete_id}`} className="athlete-link" style={{ fontSize: '1rem' }}>
                            {r.athlete_name}
                          </Link>
                        </td>
                        <td className="pr-val" style={{ fontSize: '1.3rem' }}>{r.max_weight} кг</td>
                        <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                          {r.date ? new Date(r.date).toLocaleDateString('bg-BG') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {showAddLift && (
        <Modal title="Ново упражнение" onClose={() => setShowAddLift(false)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAddLift(false)}>Откажи</button>
            <button className="btn btn-red" onClick={addLift}>Запази</button>
          </>
        }>
          {err && <div className="err">{err}</div>}
          <div className="fg">
            <label>Название *</label>
            <input className="inp" value={newLift.name} onChange={e => setNewLift(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addLift()}
              placeholder="напр. Romanian Deadlift" autoFocus />
          </div>
          <div className="fg">
            <label>Категория</label>
            <select className="inp" value={newLift.category} onChange={e => setNewLift(f => ({ ...f, category: e.target.value }))}>
              {Object.entries(CATS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </Modal>
      )}

      {showAddResult && selected && (
        <Modal title={`Добави резултат — ${selected.name}`} onClose={() => setShowAddResult(false)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAddResult(false)}>Откажи</button>
            <button className="btn btn-red" onClick={submitResult}>Запази</button>
          </>
        }>
          {resultErr && <div className="err">{resultErr}</div>}
          <div className="row">
            <div className="fg">
              <label>Тегло (кг) *</label>
              <input className="inp" type="number" step="0.5" min="0" value={resultForm.weight_kg}
                onChange={e => setResultForm(f => ({ ...f, weight_kg: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && submitResult()}
                placeholder="100" autoFocus />
            </div>
            <div className="fg">
              <label>Дата *</label>
              <input className="inp" type="date" value={resultForm.date}
                onChange={e => setResultForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="fg">
            <label>Бележки</label>
            <textarea className="inp" value={resultForm.notes}
              onChange={e => setResultForm(f => ({ ...f, notes: e.target.value }))} placeholder="Необязателно..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
