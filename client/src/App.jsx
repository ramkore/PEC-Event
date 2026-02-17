import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/EventDiscovery';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AuthContext from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    return user && user.isAdmin ? children : <Navigate to="/" />;
};

function App() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Navbar />
            <div className="container mx-auto p-4">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Events />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                </Routes>
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    )
}

export default App

