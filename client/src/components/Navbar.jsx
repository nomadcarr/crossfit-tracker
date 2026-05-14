import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">⚡ CF TRACKER</NavLink>
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
      <NavLink to="/athletes" className={({ isActive }) => isActive ? 'active' : ''}>Атлети</NavLink>
      <NavLink to="/workouts" className={({ isActive }) => isActive ? 'active' : ''}>Тренировки</NavLink>
      <NavLink to="/prs" className={({ isActive }) => isActive ? 'active' : ''}>Максимуми</NavLink>
    </nav>
  );
}
