import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import api, { errMsg, money } from '../api';
import { useAuth } from '../context/AuthContext';

const DAY = 86400000;

export default function RoomDetails() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({
    checkIn: params.get('checkIn') || '',
    checkOut: params.get('checkOut') || '',
    guests: Number(params.get('guests')) || 1,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/rooms/${id}`).then((r) => setRoom(r.data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  if (!room) return <div className="container py-5">{error || 'Loading…'}</div>;

  const nights = form.checkIn && form.checkOut
    ? Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / DAY) : 0;
  const total = nights > 0 ? nights * room.pricePerNight : 0;

  const book = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: { pathname: `/rooms/${id}` } } });
    setBusy(true);
    setError('');
    try {
      await api.post('/bookings', { roomId: id, ...form });
      navigate('/my-bookings');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5">
      <Link to="/">Back to rooms</Link>
      <div className="row g-4 mt-1">
        <div className="col-lg-7">
          <h1 className="h2 text-capitalize">{room.type} room {room.number}</h1>
          <p className="mt-3">{room.description}</p>
          <p className="mb-2">Sleeps up to {room.capacity} guests.</p>
          <div>{room.amenities.map((a) => <span className="amenity" key={a}>{a}</span>)}</div>
        </div>
        <div className="col-lg-5">
          <form className="panel" onSubmit={book}>
            <p className="price fs-4 mb-3">{money(room.pricePerNight)} <small className="text-muted fw-normal">per night</small></p>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label" htmlFor="ci">Check-in</label>
                <input id="ci" type="date" required className="form-control" value={form.checkIn}
                  min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="co">Check-out</label>
                <input id="co" type="date" required className="form-control" value={form.checkOut}
                  min={form.checkIn} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="g">Guests</label>
                <input id="g" type="number" min="1" max={room.capacity} className="form-control" value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
              </div>
            </div>
            {nights > 0 && (
              <p className="mt-3 mb-0">{nights} night{nights > 1 ? 's' : ''} · <strong>{money(total)}</strong> total</p>
            )}
            {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
            <button className="btn btn-primary w-100 mt-3" disabled={busy}>
              {user ? (busy ? 'Booking…' : 'Confirm booking') : 'Log in to book'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
