import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user && ['staff', 'admin'].includes(user.role);

  return (
    <nav className="topbar navbar navbar-expand py-3">
      <div className="container">
        <Link to="/" className="brand">HotelPro</Link>
        <div className="navbar-nav ms-auto align-items-center gap-2">
          <NavLink to="/" end className="nav-link">Rooms</NavLink>
          {user && <NavLink to="/my-bookings" className="nav-link">My bookings</NavLink>}
          {isStaff && <NavLink to="/admin" className="nav-link">Dashboard</NavLink>}
          {user ? (
            <button className="btn btn-sm btn-outline-light" onClick={() => { logout(); navigate('/'); }}>
              Log out
            </button>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">Log in</NavLink>
              <Link to="/register" className="btn btn-sm btn-light">Create account</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
