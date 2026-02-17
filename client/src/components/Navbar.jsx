import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                    <img src="/logo.png" alt="PEC Logo" className="h-10" />
                    PEC Events
                </Link>
                <div>
                    <Link to="/" className="mr-4 hover:text-blue-200">Events</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="mr-4 hover:text-blue-200">Dashboard</Link>
                            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mr-4 hover:text-blue-200">Login</Link>
                            <Link to="/register" className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
