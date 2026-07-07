import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    nav('/');
  };

  const close = () => setOpen(false);

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo" onClick={close}>⚡ CF TRACKER</NavLink>

      <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Меню">
        {open ? '✕' : '☰'}
      </button>

      <div className={`nav-links${open ? ' open' : ''}`}>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>Dashboard</NavLink>
        <NavLink to="/athletes" className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>Атлети</NavLink>
        <NavLink to="/workouts" className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>Тренировки</NavLink>
        <NavLink to="/prs" className={({ isActive }) => isActive ? 'active' : ''} onClick={close}>Максимуми</NavLink>

        <div className="nav-auth">
          {user ? (
            <>
              <NavLink to="/me" className="btn btn-ghost btn-sm" style={{ fontWeight: 700, color: 'var(--text)' }} onClick={close}>
                👤 {user.display_name}
              </NavLink>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>Изход</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>Вход</Link>
              <Link to="/register" className="btn btn-red btn-sm" onClick={close}>Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
