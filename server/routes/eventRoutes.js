const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(getEvents)
    .post(protect, createEvent);

router.route('/:id')
    .get(getEventById);

module.exports = router;
