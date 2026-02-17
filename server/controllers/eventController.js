const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, location, startDate, endDate } = req.query;
        const query = {};

        // Search by name (case-insensitive regex)
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by location (case-insensitive regex for partial match or exact match)
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filter by date range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const events = await Event.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date: 1 }); // Sort by date ascending

        const count = await Event.countDocuments(query);

        res.json({
            events,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalEvents: count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email');

        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        // CastError is returned when ID format is invalid
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
    try {
        const {
            name,
            description,
            location,
            date,
            category,
            capacity
        } = req.body;

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
            availableSeats: capacity // Initialize available seats
        });

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent
};
