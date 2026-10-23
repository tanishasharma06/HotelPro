import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errMsg, money } from '../api';

const today = () => new Date().toISOString().slice(0, 10);

export default function Home() {
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState({
    checkIn: params.get('checkIn') || '',
    checkOut: params.get('checkOut') || '',
    guests: params.get('guests') || '1',
    type: params.get('type') || '',
  });
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const query = Object.fromEntries(Object.entries(Object.fromEntries(params)).filter(([, v]) => v));
      const { data } = await api.get('/rooms', { params: query });
      setRooms(data);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const search = (e) => {
    e.preventDefault();
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      return setError('Check-out must be after check-in');
    }
    setParams(Object.fromEntries(Object.entries(form).filter(([, v]) => v)));
  };

  const stay = params.get('checkIn') && params.get('checkOut')
    ? `?checkIn=${params.get('checkIn')}&checkOut=${params.get('checkOut')}&guests=${params.get('guests') || 1}`
    : '';

  return (
    <>
      <header className="hero">
        <div className="container">
          <h1>A room that is free when you are</h1>
          <p className="mt-3 mb-0">Pick your dates and see only the rooms available for your whole stay.</p>
        </div>
      </header>

      <div className="container">
        <form className="search-panel row g-3 align-items-end" onSubmit={search}>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="ci">Check-in</label>
            <input id="ci" type="date" className="form-control" min={today()} value={form.checkIn} onChange={set('checkIn')} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="co">Check-out</label>
            <input id="co" type="date" className="form-control" min={form.checkIn || today()} value={form.checkOut} onChange={set('checkOut')} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="g">Guests</label>
            <input id="g" type="number" min="1" max="10" className="form-control" value={form.guests} onChange={set('guests')} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="t">Room type</label>
            <select id="t" className="form-select" value={form.type} onChange={set('type')}>
              <option value="">Any</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </div>
          <div className="col-12 col-md-2 d-grid">
            <button className="btn btn-primary">Search rooms</button>
          </div>
        </form>

        {error && <div className="alert alert-danger mt-4">{error}</div>}

        <section className="py-5">
          <h2 className="h3 mb-4">{loading ? 'Looking for rooms…' : `${rooms.length} room${rooms.length === 1 ? '' : 's'} available`}</h2>
          {!loading && rooms.length === 0 && !error && (
            <div className="panel">No rooms match. Try different dates or fewer guests.</div>
          )}
          <div className="row g-4">
            {rooms.map((r) => (
              <div className="col-md-6 col-lg-3" key={r._id}>
                <div className="room-card">
                  <div className="room-art">{r.image ? <img src={r.image} alt="" /> : <span className="text-capitalize">{r.type}</span>}</div>
                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <strong>Room {r.number}</strong>
                      <span className="price">{money(r.pricePerNight)}<small className="text-muted fw-normal"> / night</small></span>
                    </div>
                    <p className="small text-muted my-2">Sleeps {r.capacity}. {r.description}</p>
                    <div className="mb-3">{r.amenities.map((a) => <span className="amenity" key={a}>{a}</span>)}</div>
                    <Link to={`/rooms/${r._id}${stay}`} className="btn btn-outline-primary mt-auto">View and book</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
