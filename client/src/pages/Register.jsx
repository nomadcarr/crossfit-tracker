import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ nickname: '', password: '', confirm: '', display_name: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nickname || !form.password || !form.display_name) { setErr('Попълни всички полета'); return; }
    if (form.password !== form.confirm) { setErr('Паролите не съвпадат'); return; }
    if (form.password.length < 6) { setErr('Паролата трябва да е поне 6 символа'); return; }
    setBusy(true);
    try {
      await register(form.nickname, form.password, form.display_name);
      nav('/me');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 58px)', padding: '20px 0' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 6 }}>Регистрация</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 20 }}>
            Вече имаш профил? <Link to="/login" style={{ color: 'var(--red)' }}>Влез</Link>
          </p>
          {err && <div className="err">{err}</div>}
          <form onSubmit={submit}>
            <div className="fg">
              <label>Никнейм *</label>
              <input className="inp" value={form.nickname} autoFocus
                onChange={e => setForm(f => ({ ...f, nickname: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                placeholder="ivan_petrov" />
              <div style={{ fontSize: '0.75rem', color: 'var(--dim)', marginTop: 3 }}>Само латиница, без интервали — за вход</div>
            </div>
            <div className="fg">
              <label>Показвано ime *</label>
              <input className="inp" value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                placeholder="Иван Петров" />
              <div style={{ fontSize: '0.75rem', color: 'var(--dim)', marginTop: 3 }}>Така ще те виждат другите атлети</div>
            </div>
            <div className="fg">
              <label>Парола *</label>
              <input className="inp" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Минимум 6 символа" />
            </div>
            <div className="fg">
              <label>Потвърди парола *</label>
              <input className="inp" type="password" value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="••••••" />
            </div>
            <button className="btn btn-red" type="submit" disabled={busy}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {busy ? 'Регистрация...' : 'Създай профил'}
            </button>
          </form>
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Продължи като гост →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
