import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav('/');
  };

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">⚡ CF TRACKER</NavLink>
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
      <NavLink to="/athletes" className={({ isActive }) => isActive ? 'active' : ''}>Атлети</NavLink>
      <NavLink to="/workouts" className={({ isActive }) => isActive ? 'active' : ''}>Тренировки</NavLink>
      <NavLink to="/prs" className={({ isActive }) => isActive ? 'active' : ''}>Максимуми</NavLink>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {user ? (
          <>
            <NavLink to="/me" className={({ isActive }) => `btn btn-ghost btn-sm${isActive ? '' : ''}`}
              style={{ fontWeight: 700, color: 'var(--text)' }}>
              👤 {user.display_name}
            </NavLink>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Изход</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Вход</Link>
            <Link to="/register" className="btn btn-red btn-sm">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
}
