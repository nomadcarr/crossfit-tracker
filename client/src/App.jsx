import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Athletes from './pages/Athletes';
import AthleteProfile from './pages/AthleteProfile';
import Workouts from './pages/Workouts';
import WorkoutDetail from './pages/WorkoutDetail';
import PRTracker from './pages/PRTracker';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/athletes/:id" element={<AthleteProfile />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/:id" element={<WorkoutDetail />} />
        <Route path="/prs" element={<PRTracker />} />
      </Routes>
    </>
  );
}
