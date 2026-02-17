const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getAllRegistrations,
    getAllUsers
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);

router.route('/events')
    .get(getAllEvents)
    .post(createEvent);

router.route('/events/:id')
    .put(updateEvent)
    .delete(deleteEvent);

router.get('/registrations', getAllRegistrations);
router.get('/users', getAllUsers);

module.exports = router;
