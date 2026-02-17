import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'eventDiscoveryState';

// Save browsing state to sessionStorage
const saveState = (state) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// Restore browsing state from sessionStorage
const loadState = () => {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

const EventDiscovery = () => {
    const saved = loadState();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(saved?.search || '');
    const [category, setCategory] = useState(saved?.category || '');
    const [location, setLocation] = useState(saved?.location || '');
    const [startDate, setStartDate] = useState(saved?.startDate || '');
    const [endDate, setEndDate] = useState(saved?.endDate || '');
    const [page, setPage] = useState(saved?.page || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalEvents, setTotalEvents] = useState(0);

    const fetchEvents = useCallback(async (currentPage) => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit: 9 };
            if (search) params.search = search;
            if (category) params.category = category;
            if (location) params.location = location;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await api.get('/events', { params });
            setEvents(res.data.events);
            setTotalPages(res.data.totalPages);
            setTotalEvents(res.data.totalEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, [search, category, location, startDate, endDate]);

    // Save state whenever filters or page changes
    useEffect(() => {
        saveState({ search, category, location, startDate, endDate, page });
    }, [search, category, location, startDate, endDate, page]);

    // Debounced fetch when filters change (reset to page 1)
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchEvents(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, category, location, startDate, endDate]);

    // Fetch when page changes (but not on filter changes which reset page)
    useEffect(() => {
        if (page > 1) {
            fetchEvents(page);
        }
    }, [page]);

    // Initial load from saved state
    useEffect(() => {
        if (saved?.page && saved.page > 1) {
            fetchEvents(saved.page);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClearFilters = () => {
        setSearch('');
        setCategory('');
        setLocation('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const hasActiveFilters = search || category || location || startDate || endDate;

    const getAvailabilityColor = (available, capacity) => {
        const ratio = available / capacity;
        if (ratio === 0) return 'text-red-600';
        if (ratio <= 0.2) return 'text-orange-500';
        return 'text-green-600';
    };

    const getAvailabilityBadge = (available, capacity) => {
        if (available === 0) return { text: 'Sold Out', bg: 'bg-red-100 text-red-700' };
        if (available / capacity <= 0.2) return { text: 'Almost Full', bg: 'bg-orange-100 text-orange-700' };
        return { text: 'Available', bg: 'bg-green-100 text-green-700' };
    };

    return (
        <div className="container mx-auto mt-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Discover Events</h1>

            {/* Filter Panel */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                {/* Row 1: Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search events by name..."
                        className="border p-3 rounded w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Row 2: Category, Location */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <select
                        className="border p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Tech">Tech</option>
                        <option value="Sports">Sports</option>
                        <option value="Music">Music</option>
                        <option value="Business">Business</option>
                        <option value="Other">Other</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Filter by location..."
                        className="border p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                {/* Row 3: Date Range */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">From Date</label>
                        <input
                            type="date"
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">To Date</label>
                        <input
                            type="date"
                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition whitespace-nowrap"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Results Summary */}
            {!loading && (
                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">
                        Showing <span className="font-bold">{events.length}</span> of{' '}
                        <span className="font-bold">{totalEvents}</span> events
                        {hasActiveFilters && ' (filtered)'}
                    </p>
                    {totalPages > 1 && (
                        <p className="text-gray-500 text-sm">
                            Page {page} of {totalPages}
                        </p>
                    )}
                </div>
            )}

            {/* Event Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-500">Loading events...</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.length > 0 ? (
                            events.map((event) => {
                                const badge = getAvailabilityBadge(event.availableSeats, event.capacity);
                                return (
                                    <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                                                    {event.category}
                                                </span>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded ${badge.bg}`}>
                                                    {badge.text}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold mb-2 line-clamp-1">{event.name}</h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                                            <div className="space-y-2 text-sm text-gray-500 mb-4">
                                                <div className="flex items-center">
                                                    <span className="mr-2">📅</span>
                                                    <span>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-2">📍</span>
                                                    <span className="line-clamp-1">{event.location}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-2">👥</span>
                                                    <span className={getAvailabilityColor(event.availableSeats, event.capacity)}>
                                                        {event.availableSeats} / {event.capacity} seats available
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/events/${event._id}`}
                                                className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-400 text-lg mb-2">No events found</p>
                                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="mt-4 text-blue-600 hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`px-4 py-2 rounded font-medium transition ${page === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                ← Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-3 py-2 rounded font-medium transition ${pageNum === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 border hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`px-4 py-2 rounded font-medium transition ${page === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EventDiscovery;
