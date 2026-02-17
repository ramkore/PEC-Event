const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an event name'],
        trim: true
    },
    organizer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
        index: true
    },
    date: {
        type: Date,
        required: [true, 'Please add a date and time']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Tech', 'Sports', 'Music', 'Business', 'Other'],
        index: true
    },
    capacity: {
        type: Number,
        required: [true, 'Please add capacity'],
        min: 1
    },
    availableSeats: {
        type: Number
    },
    registeredUsers: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Calculate available seats before saving (if needed, though logic likely in controller)
eventSchema.pre('save', function (next) {
    if (this.isNew) {
        this.availableSeats = this.capacity;
    }
    next();
});

module.exports = mongoose.model('Event', eventSchema);
