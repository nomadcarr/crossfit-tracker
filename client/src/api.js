const token = () => localStorage.getItem('cf_token');
const authH = () => ({ ...(token() ? { Authorization: `Bearer ${token()}` } : {}) });

const h = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Грешка');
  return data;
};
const get = (url) => fetch(url).then(h);
const post = (url, d) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authH() }, body: JSON.stringify(d) }).then(h);
const put = (url, d) => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authH() }, body: JSON.stringify(d) }).then(h);
const del = (url) => fetch(url, { method: 'DELETE', headers: authH() }).then(h);

export const getStats = () => get('/api/stats');
export const getAthletes = () => get('/api/athletes');
export const getAthlete = (id) => get(`/api/athletes/${id}`);
export const createAthlete = (d) => post('/api/athletes', d);
export const updateAthlete = (id, d) => put(`/api/athletes/${id}`, d);
export const deleteAthlete = (id) => del(`/api/athletes/${id}`);
export const addAthleteRecord = (aid, d) => post(`/api/athletes/${aid}/records`, d);
export const deleteAthleteRecord = (aid, rid) => del(`/api/athletes/${aid}/records/${rid}`);

export const getWorkouts = () => get('/api/workouts');
export const getWorkout = (id) => get(`/api/workouts/${id}`);
export const createWorkout = (d) => post('/api/workouts', d);
export const updateWorkout = (id, d) => put(`/api/workouts/${id}`, d);
export const deleteWorkout = (id) => del(`/api/workouts/${id}`);
export const addWorkoutResult = (wid, d) => post(`/api/workouts/${wid}/results`, d);
export const deleteWorkoutResult = (wid, rid) => del(`/api/workouts/${wid}/results/${rid}`);

export const getLifts = () => get('/api/lifts');
export const createLift = (d) => post('/api/lifts', d);
export const getLiftLeaderboard = (id) => get(`/api/lifts/${id}/leaderboard`);
export const deleteLift = (id) => del(`/api/lifts/${id}`);
