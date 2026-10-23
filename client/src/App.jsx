import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import RoomDetails from './pages/RoomDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['staff', 'admin']}><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<p className="container py-5">Page not found.</p>} />
      </Routes>
    </>
  );
}
