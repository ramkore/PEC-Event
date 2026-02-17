import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const CATEGORIES = ['Sports Fest', 'Technical Fest', 'Cultural Fest', 'Annual Day'];

const AdminPanel = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventForm, setEventForm] = useState({
        name: '', description: '', location: '', date: '', category: CATEGORIES[0], capacity: ''
    });

    useEffect(() => {
        if (authLoading) return;
        if (!user || !user.isAdmin) {
            navigate('/');
            return;
        }
        fetchData(activeTab);
    }, [activeTab, user, navigate, authLoading]);

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            switch (tab) {
                case 'dashboard': {
                    const res = await api.get('/admin/stats');
                    setStats(res.data);
                    break;
                }
                case 'events': {
                    const res = await api.get('/admin/events');
                    setEvents(res.data);
                    break;
                }
                case 'registrations': {
                    const res = await api.get('/admin/registrations');
                    setRegistrations(res.data);
                    break;
                }
                case 'users': {
                    const res = await api.get('/admin/users');
                    setUsers(res.data);
                    break;
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEventForm({ name: '', description: '', location: '', date: '', category: CATEGORIES[0], capacity: '' });
        setEditingEvent(null);
        setShowEventForm(false);
    };

    const handleSubmitEvent = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await api.put(`/admin/events/${editingEvent._id}`, eventForm);
            } else {
                await api.post('/admin/events', eventForm);
            }
            resetForm();
            fetchData('events');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save event');
        }
    };

    const handleEditEvent = (event) => {
        setEventForm({
            name: event.name,
            description: event.description,
            location: event.location,
            date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
            category: event.category,
            capacity: event.capacity
        });
        setEditingEvent(event);
        setShowEventForm(true);
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Delete this event and all its registrations?')) return;
        try {
            await api.delete(`/admin/events/${id}`);
            fetchData('events');
        } catch (error) {
            alert('Failed to delete event');
        }
    };

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
        { id: 'events', label: '📅 Events', icon: '📅' },
        { id: 'registrations', label: '📋 Registrations', icon: '📋' },
        { id: 'users', label: '👥 Users', icon: '👥' }
    ];

    const StatCard = ({ label, value, color, icon }) => (
        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                <span className="text-4xl opacity-30">{icon}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white py-6 px-4 shadow-lg">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold">🛡️ PEC Admin Panel</h1>
                    <p className="text-indigo-200 text-sm mt-1">Manage events, registrations, and users</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto flex overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto p-4 mt-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && stats && (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <StatCard label="Total Events" value={stats.totalEvents} color="border-blue-500" icon="📅" />
                                    <StatCard label="Total Users" value={stats.totalUsers} color="border-green-500" icon="👥" />
                                    <StatCard label="Active Registrations" value={stats.activeRegistrations} color="border-indigo-500" icon="✅" />
                                    <StatCard label="Cancelled" value={stats.cancelledRegistrations} color="border-red-500" icon="❌" />
                                </div>

                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-lg font-bold mb-4">Events by Category</h3>
                                    <div className="space-y-3">
                                        {stats.categoryStats.map(cat => (
                                            <div key={cat._id} className="flex items-center justify-between">
                                                <span className="font-medium">{cat._id}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-48 bg-gray-200 rounded-full h-3">
                                                        <div
                                                            className="bg-indigo-500 h-3 rounded-full transition-all"
                                                            style={{ width: `${(cat.count / stats.totalEvents) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-600 w-8">{cat.count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Events Tab */}
                        {activeTab === 'events' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">All Events ({events.length})</h2>
                                    <button
                                        onClick={() => { resetForm(); setShowEventForm(true); }}
                                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium shadow"
                                    >
                                        + Create Event
                                    </button>
                                </div>

                                {/* Event Form Modal */}
                                {showEventForm && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                            <div className="p-6">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-xl font-bold">
                                                        {editingEvent ? '✏️ Edit Event' : '➕ Create Event'}
                                                    </h3>
                                                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                                                </div>
                                                <form onSubmit={handleSubmitEvent} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                            value={eventForm.name}
                                                            onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                        <textarea
                                                            required
                                                            rows={3}
                                                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                            value={eventForm.description}
                                                            onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                            <select
                                                                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                                value={eventForm.category}
                                                                onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                                                            >
                                                                {CATEGORIES.map(cat => (
                                                                    <option key={cat} value={cat}>{cat}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                                            <input
                                                                type="number"
                                                                required
                                                                min={1}
                                                                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                                value={eventForm.capacity}
                                                                onChange={e => setEventForm({ ...eventForm, capacity: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                            value={eventForm.location}
                                                            onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                                        <input
                                                            type="datetime-local"
                                                            required
                                                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                            value={eventForm.date}
                                                            onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="flex gap-3 pt-4">
                                                        <button
                                                            type="submit"
                                                            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium"
                                                        >
                                                            {editingEvent ? 'Update Event' : 'Create Event'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={resetForm}
                                                            className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Events Table */}
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Event</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Date</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Seats</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {events.map(event => (
                                                    <tr key={event._id} className="hover:bg-gray-50 transition">
                                                        <td className="p-4">
                                                            <p className="font-semibold">{event.name}</p>
                                                            <p className="text-sm text-gray-500 truncate max-w-xs">{event.location}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded">
                                                                {event.category}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-600">
                                                            {new Date(event.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-4 text-sm">
                                                            <span className={event.availableSeats === 0 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                                                                {event.availableSeats}/{event.capacity}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditEvent(event)}
                                                                    className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                                                                >
                                                                    ✏️ Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteEvent(event._id)}
                                                                    className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {events.length === 0 && (
                                        <div className="text-center py-12 text-gray-400">No events found</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Registrations Tab */}
                        {activeTab === 'registrations' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">All Registrations ({registrations.length})</h2>
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">User</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Event</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Registered On</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {registrations.map(reg => (
                                                    <tr key={reg._id} className="hover:bg-gray-50 transition">
                                                        <td className="p-4">
                                                            <p className="font-medium">{reg.user?.name || 'Unknown'}</p>
                                                            <p className="text-sm text-gray-500">{reg.user?.email}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="font-medium">{reg.event?.name || 'Deleted Event'}</p>
                                                            <p className="text-xs text-gray-500">{reg.event?.category}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded uppercase ${reg.status === 'confirmed'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {reg.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-600">
                                                            {new Date(reg.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {registrations.length === 0 && (
                                        <div className="text-center py-12 text-gray-400">No registrations yet</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">All Users ({users.length})</h2>
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Name</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Email</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Role</th>
                                                    <th className="text-left p-4 text-sm font-semibold text-gray-600">Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {users.map(u => (
                                                    <tr key={u._id} className="hover:bg-gray-50 transition">
                                                        <td className="p-4 font-medium">{u.name}</td>
                                                        <td className="p-4 text-sm text-gray-600">{u.email}</td>
                                                        <td className="p-4">
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded ${u.isAdmin
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {u.isAdmin ? 'Admin' : 'User'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-600">
                                                            {new Date(u.createdAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {users.length === 0 && (
                                        <div className="text-center py-12 text-gray-400">No users found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
