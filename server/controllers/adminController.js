const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res) => {
    try {
        const [totalEvents, totalUsers, totalRegistrations, activeRegistrations] = await Promise.all([
            Event.countDocuments(),
            User.countDocuments(),
            Registration.countDocuments(),
            Registration.countDocuments({ status: 'confirmed' })
        ]);

        // Category-wise event counts
        const categoryStats = await Event.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalEvents,
            totalUsers,
            totalRegistrations,
            activeRegistrations,
            cancelledRegistrations: totalRegistrations - activeRegistrations,
            categoryStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all events (admin)
// @route   GET /api/admin/events
// @access  Admin
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'name email')
            .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create event (admin)
// @route   POST /api/admin/events
// @access  Admin
const createEvent = async (req, res) => {
    try {
        const { name, description, location, date, category, capacity } = req.body;

        if (!name || !description || !location || !date || !category || !capacity) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const event = await Event.create({
            name,
            description,
            location,
            date,
            category,
            capacity,
            organizer: req.user.id,
            availableSeats: capacity
        });

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update event (admin)
// @route   PUT /api/admin/events/:id
// @access  Admin
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const { name, description, location, date, category, capacity } = req.body;

        // Recalculate available seats if capacity changed
        if (capacity && capacity !== event.capacity) {
            const seatsTaken = event.capacity - event.availableSeats;
            event.availableSeats = Math.max(0, capacity - seatsTaken);
            event.capacity = capacity;
        }

        if (name) event.name = name;
        if (description) event.description = description;
        if (location) event.location = location;
        if (date) event.date = date;
        if (category) event.category = category;

        await event.save();
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete event (admin)
// @route   DELETE /api/admin/events/:id
// @access  Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Delete all registrations for this event
        await Registration.deleteMany({ event: req.params.id });
        await Event.findByIdAndDelete(req.params.id);

        res.json({ message: 'Event and related registrations deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all registrations (admin)
// @route   GET /api/admin/registrations
// @access  Admin
const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find()
            .populate('user', 'name email')
            .populate('event', 'name date location category')
            .sort({ createdAt: -1 });

        res.json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getStats,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getAllRegistrations,
    getAllUsers
};
