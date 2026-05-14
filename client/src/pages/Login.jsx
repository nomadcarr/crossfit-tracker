import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ nickname: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nickname || !form.password) { setErr('Попълни всички полета'); return; }
    setBusy(true);
    try {
      await login(form.nickname, form.password);
      nav('/me');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 58px)' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 16px' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 6 }}>Вход</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 20 }}>
            Нямаш профил? <Link to="/register" style={{ color: 'var(--red)' }}>Регистрирай се</Link>
          </p>
          {err && <div className="err">{err}</div>}
          <form onSubmit={submit}>
            <div className="fg">
              <label>Никнейм</label>
              <input className="inp" value={form.nickname} autoFocus
                onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
                placeholder="ivan_petrov" />
            </div>
            <div className="fg">
              <label>Парола</label>
              <input className="inp" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••" />
            </div>
            <button className="btn btn-red" type="submit" disabled={busy}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {busy ? 'Влизане...' : 'Влез'}
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
