import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState(null); // 'confirmed', 'cancelled', or null
    const [registrationId, setRegistrationId] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`);
                setEvent(res.data);
            } catch (error) {
                console.error('Error fetching event:', error);
                toast.error('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    // Check if user is already registered for this event
    useEffect(() => {
        const checkRegistration = async () => {
            if (!user) {
                setRegistrationStatus(null);
                setRegistrationId(null);
                return;
            }
            try {
                const res = await api.get('/registrations/user');
                const match = res.data.find(
                    (reg) => reg.event._id === id || reg.event === id
                );
                if (match) {
                    setRegistrationStatus(match.status);
                    setRegistrationId(match._id);
                } else {
                    setRegistrationStatus(null);
                    setRegistrationId(null);
                }
            } catch (error) {
                console.error('Error checking registration:', error);
            }
        };
        checkRegistration();
    }, [id, user]);

    const handleRegister = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setRegistering(true);
        try {
            const res = await api.post('/registrations', { eventId: id });
            toast.success('Successfully registered!');
            setRegistrationStatus('confirmed');
            setRegistrationId(res.data._id);
            // Refresh event data to update seat count
            const eventRes = await api.get(`/events/${id}`);
            setEvent(eventRes.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    const handleCancelRegistration = async () => {
        if (!registrationId) return;

        if (!window.confirm('Are you sure you want to cancel your registration?')) return;

        try {
            await api.delete(`/registrations/${registrationId}`);
            toast.success('Registration cancelled');
            setRegistrationStatus('cancelled');
            // Refresh event data to update seat count
            const eventRes = await api.get(`/events/${id}`);
            setEvent(eventRes.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cancellation failed');
        }
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (!event) return <div className="text-center mt-8">Event not found</div>;

    const renderRegistrationButton = () => {
        if (registrationStatus === 'confirmed') {
            return (
                <div>
                    <div className="w-full bg-green-100 text-green-800 py-3 rounded font-bold text-center mb-3">
                        ✅ You are registered
                    </div>
                    <button
                        onClick={handleCancelRegistration}
                        className="w-full bg-red-100 text-red-600 py-2.5 rounded font-medium hover:bg-red-200 transition"
                    >
                        Cancel Registration
                    </button>
                </div>
            );
        }

        if (event.availableSeats > 0) {
            return (
                <button
                    onClick={handleRegister}
                    disabled={registering}
                    className={`w-full py-3 rounded text-white font-bold transition ${registering ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {registering ? 'Registering...' : 'Register Now'}
                </button>
            );
        }

        return (
            <button disabled className="w-full bg-gray-300 text-gray-500 py-3 rounded font-bold cursor-not-allowed">
                Sold Out
            </button>
        );
    };

    return (
        <div className="container mx-auto mt-8 px-4">
            <button onClick={() => navigate('/')} className="mb-4 text-blue-600 hover:underline">← Back to Events</button>

            <div className="bg-white rounded shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">{event.category}</span>
                            <h1 className="text-3xl font-bold mt-4 mb-2">{event.name}</h1>
                            <p className="text-gray-500 mb-4">Organized by {event.organizer?.name || 'Unknown'}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                                {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        <div className="md:col-span-2">
                            <h2 className="text-xl font-semibold mb-4">About this Event</h2>
                            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg h-fit">
                            <h3 className="text-lg font-semibold mb-4">Registration Info</h3>
                            <div className="space-y-3 mb-6">
                                <p className="flex justify-between">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-medium text-right">{event.location}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-600">Capacity:</span>
                                    <span className="font-medium">{event.capacity}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-600">Available Seats:</span>
                                    <span className={`font-bold ${event.availableSeats > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {event.availableSeats}
                                    </span>
                                </p>
                            </div>

                            {renderRegistrationButton()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
