import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAthletes, createAthlete, updateAthlete, deleteAthlete } from '../api';
import Modal from '../components/Modal';

export default function Athletes() {
  const [athletes, setAthletes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => getAthletes().then(setAthletes).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openEdit = (a) => { setEditing(a); setName(a.name); setErr(''); };
  const openAdd = () => { setShowAdd(true); setName(''); setErr(''); };
  const close = () => { setShowAdd(false); setEditing(null); setErr(''); };

  const submit = async () => {
    if (!name.trim()) { setErr('Въведи имеe'); return; }
    try {
      if (editing) {
        await updateAthlete(editing.id, { name });
      } else {
        await createAthlete({ name });
      }
      load();
      close();
    } catch (e) { setErr(e.message); }
  };

  const remove = async (a) => {
    if (!confirm(`Изтрий ${a.name}? Всички резултати ще бъдат изтрити.`)) return;
    await deleteAthlete(a.id);
    load();
  };

  const form = (
    <>
      {err && <div className="err">{err}</div>}
      <div className="fg">
        <label>Име</label>
        <input
          className="inp"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
          placeholder="Иван Иванов"
        />
      </div>
    </>
  );

  return (
    <div className="page">
      <div className="ph">
        <h1>Атлети</h1>
        <button className="btn btn-red" onClick={openAdd}>+ Добави атлет</button>
      </div>

      {loading ? <div className="loading">Зарежда...</div> : athletes.length === 0 ? (
        <div className="card empty">
          <div className="empty-icon">🏋️</div>
          <p>Няма добавени атлети</p>
        </div>
      ) : (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Атлет</th>
                <th>Тренировки</th>
                <th>Рекорди</th>
                <th>Добавен</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {athletes.map(a => (
                <tr key={a.id}>
                  <td>
                    <Link to={`/athletes/${a.id}`} style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem' }}>
                      {a.name}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{a.workout_count}</td>
                  <td style={{ color: 'var(--muted)' }}>{a.pr_count}</td>
                  <td style={{ color: 'var(--dim)', fontSize: '0.82rem' }}>
                    {new Date(a.created_at).toLocaleDateString('bg-BG')}
                  </td>
                  <td>
                    <div className="flex" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-xs" onClick={() => openEdit(a)}>Редактирай</button>
                      <button className="btn btn-danger btn-xs" onClick={() => remove(a)}>Изтрий</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showAdd || editing) && (
        <Modal
          title={editing ? 'Редактирай атлет' : 'Добави атлет'}
          onClose={close}
          footer={
            <>
              <button className="btn btn-ghost" onClick={close}>Откажи</button>
              <button className="btn btn-red" onClick={submit}>Запази</button>
            </>
          }
        >
          {form}
        </Modal>
      )}
    </div>
  );
}
