const h = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Грешка');
  return data;
};

export const getStats = () => fetch('/api/stats').then(h);
export const getAthletes = () => fetch('/api/athletes').then(h);
export const getAthlete = (id) => fetch(`/api/athletes/${id}`).then(h);
export const createAthlete = (d) => fetch('/api/athletes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(h);
export const updateAthlete = (id, d) => fetch(`/api/athletes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(h);
export const deleteAthlete = (id) => fetch(`/api/athletes/${id}`, { method: 'DELETE' }).then(h);
export const addAthleteRecord = (aid, d) => fetch(`/api/athletes/${aid}/records`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(h);
export const deleteAthleteRecord = (aid, rid) => fetch(`/api/athletes/${aid}/records/${rid}`, { method: 'DELETE' }).then(h);

export const getWorkouts = () => fetch('/api/workouts').then(h);
export const getWorkout = (id) => fetch(`/api/workouts/${id}`).then(h);
export const createWorkout = (d) => fetch('/api/workouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(h);
export const updateWorkout = (id, d) => fetch(`/api/workouts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(h);
export const deleteWorkout = (id) => fetch(`/api/workouts/${id}`, { method: 'DELETE' }).then(h);
export const addWorkoutResult = (wid, d) => fetch(`/api/workouts/${wid}/results`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(h);
export const deleteWorkoutResult = (wid, rid) => fetch(`/api/workouts/${wid}/results/${rid}`, { method: 'DELETE' }).then(h);

export const getLifts = () => fetch('/api/lifts').then(h);
export const createLift = (d) => fetch('/api/lifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(h);
export const getLiftLeaderboard = (id) => fetch(`/api/lifts/${id}/leaderboard`).then(h);
export const deleteLift = (id) => fetch(`/api/lifts/${id}`, { method: 'DELETE' }).then(h);
