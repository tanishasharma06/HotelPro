import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, fmtDate, money } from '../api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/bookings/mine').then((r) => setBookings(r.data)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await api.patch(`/bookings/${id}/cancel`); load(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <div className="container py-5">
      <h1 className="h2 mb-4">My bookings</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && bookings.length === 0 && (
        <div className="panel">You have no bookings yet. <Link to="/">Find a room</Link></div>
      )}
      <div className="d-grid gap-3">
        {bookings.map((b) => (
          <div className="panel d-flex flex-wrap justify-content-between align-items-center gap-3" key={b._id}>
            <div>
              <strong className="text-capitalize">{b.room?.type} room {b.room?.number}</strong>
              <div className="text-muted small">{fmtDate(b.checkIn)} to {fmtDate(b.checkOut)} · {b.guests} guest{b.guests > 1 ? 's' : ''}</div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="price">{money(b.totalPrice)}</span>
              <span className={`status status-${b.status}`}>{b.status}</span>
              {b.status === 'confirmed' && (
                <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(b._id)}>Cancel booking</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
