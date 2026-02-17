const express = require('express');
const router = express.Router();
const {
    registerForEvent,
    getUserRegistrations,
    cancelRegistration
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

router.route('/')
    .post(protect, registerForEvent);

router.get('/user', protect, getUserRegistrations);

router.delete('/:id', protect, cancelRegistration);

module.exports = router;
