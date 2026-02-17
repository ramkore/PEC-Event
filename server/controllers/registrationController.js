const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Register user for an event
// @route   POST /api/registrations
// @access  Private
const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.body;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user already registered (only block if status is confirmed)
        const existingRegistration = await Registration.findOne({
            user: req.user.id,
            event: eventId,
            status: 'confirmed'
        });

        if (existingRegistration) {
            return res.status(400).json({ message: 'User already registered for this event' });
        }

        // Check for available seats
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'Event is fully booked' });
        }

        // Check if there's a cancelled registration to reactivate
        const cancelledRegistration = await Registration.findOne({
            user: req.user.id,
            event: eventId,
            status: 'cancelled'
        });

        let registration;
        if (cancelledRegistration) {
            // Reactivate cancelled registration
            cancelledRegistration.status = 'confirmed';
            await cancelledRegistration.save();
            registration = cancelledRegistration;
        } else {
            // Create new registration
            registration = await Registration.create({
                user: req.user.id,
                event: eventId
            });
        }

        // Decrement available seats
        event.availableSeats -= 1;

        // Add user to event's registeredUsers array
        event.registeredUsers.push(req.user.id);

        await event.save();

        res.status(201).json(registration);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get logged in user's registrations
// @route   GET /api/registrations/user
// @access  Private
const getUserRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user.id })
            .populate('event', 'name date location category description');

        res.json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private
const cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Make sure user owns the registration
        if (registration.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const event = await Event.findById(registration.event);

        // Update status to cancelled
        registration.status = 'cancelled';
        await registration.save();

        // OR deeply delete if preferred by requirements ("Mark as cancelled" was requested)
        // await registration.remove(); 

        // Increment available seats if event still exists
        if (event) {
            event.availableSeats += 1;
            // Remove user from registeredUsers array
            event.registeredUsers = event.registeredUsers.filter(
                (userId) => userId.toString() !== req.user.id
            );
            await event.save();
        }

        res.json({ message: 'Registration cancelled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerForEvent,
    getUserRegistrations,
    cancelRegistration
};
