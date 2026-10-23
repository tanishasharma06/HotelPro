import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate, money } from '../api';
import { useAuth } from '../context/AuthContext';

const blank = { number: '', type: 'single', pricePerNight: '', capacity: 1, description: '', amenities: '' };

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [tab, setTab] = useState('bookings');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [s, b, r] = await Promise.all([api.get('/bookings/stats/summary'), api.get('/bookings'), api.get('/rooms')]);
      setStats(s.data); setBookings(b.data); setRooms(r.data);
    } catch (e) { setError(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);

  const act = async (fn) => { setError(''); try { await fn(); await load(); } catch (e) { setError(errMsg(e)); } };

  const saveRoom = (e) => {
    e.preventDefault();
    const payload = { ...form, amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean) };
    act(async () => {
      editId ? await api.put(`/rooms/${editId}`, payload) : await api.post('/rooms', payload);
      setForm(blank); setEditId(null);
    });
  };

  const edit = (r) => { setEditId(r._id); setForm({ ...r, amenities: r.amenities.join(', ') }); window.scrollTo(0, 0); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="container py-5">
      <h1 className="h2 mb-4">Dashboard</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {stats && (
        <div className="row g-3 mb-4">
          {[['Rooms', stats.rooms], ['Active bookings', stats.activeBookings], ['Occupancy', `${stats.occupancy}%`], ['Revenue', money(stats.revenue)]].map(([l, v]) => (
            <div className="col-6 col-lg-3" key={l}><div className="stat"><div className="num">{v}</div><div className="text-muted small">{l}</div></div></div>
          ))}
        </div>
      )}

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>Bookings</button></li>
        {isAdmin && <li className="nav-item"><button className={`nav-link ${tab === 'rooms' ? 'active' : ''}`} onClick={() => setTab('rooms')}>Rooms</button></li>}
      </ul>

      {tab === 'bookings' && (
        <div className="panel table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Guest</th><th>Room</th><th>Stay</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.user?.name}<div className="small text-muted">{b.user?.email}</div></td>
                  <td>{b.room?.number}</td>
                  <td>{fmtDate(b.checkIn)} to {fmtDate(b.checkOut)}</td>
                  <td>{money(b.totalPrice)}</td>
                  <td><span className={`status status-${b.status}`}>{b.status}</span></td>
                  <td className="text-nowrap">
                    {b.status === 'confirmed' && <>
                      <button className="btn btn-sm btn-primary me-1" onClick={() => act(() => api.patch(`/bookings/${b._id}/status`, { status: 'checked-in' }))}>Check in</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => act(() => api.patch(`/bookings/${b._id}/cancel`))}>Cancel</button>
                    </>}
                    {b.status === 'checked-in' && <button className="btn btn-sm btn-primary" onClick={() => act(() => api.patch(`/bookings/${b._id}/status`, { status: 'checked-out' }))}>Check out</button>}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="6" className="text-muted">No bookings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'rooms' && isAdmin && (
        <div className="row g-4">
          <div className="col-lg-4">
            <form className="panel" onSubmit={saveRoom}>
              <h2 className="h5 mb-3">{editId ? 'Edit room' : 'Add a room'}</h2>
              <input className="form-control mb-2" placeholder="Room number" required value={form.number} onChange={set('number')} />
              <select className="form-select mb-2" value={form.type} onChange={set('type')}>
                {['single', 'double', 'deluxe', 'suite'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <input className="form-control mb-2" type="number" placeholder="Price per night" required value={form.pricePerNight} onChange={set('pricePerNight')} />
              <input className="form-control mb-2" type="number" min="1" placeholder="Capacity" required value={form.capacity} onChange={set('capacity')} />
              <input className="form-control mb-2" placeholder="Amenities, comma separated" value={form.amenities} onChange={set('amenities')} />
              <textarea className="form-control mb-3" rows="2" placeholder="Description" value={form.description} onChange={set('description')} />
              <button className="btn btn-primary me-2">{editId ? 'Save changes' : 'Add room'}</button>
              {editId && <button type="button" className="btn btn-link" onClick={() => { setEditId(null); setForm(blank); }}>Cancel edit</button>}
            </form>
          </div>
          <div className="col-lg-8">
            <div className="panel table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Room</th><th>Type</th><th>Price</th><th>Sleeps</th><th></th></tr></thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r._id}>
                      <td>{r.number}</td><td className="text-capitalize">{r.type}</td><td>{money(r.pricePerNight)}</td><td>{r.capacity}</td>
                      <td className="text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(r)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm('Remove this room?') && act(() => api.delete(`/rooms/${r._id}`))}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
