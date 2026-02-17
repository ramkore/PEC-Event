const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to database on first request (lazy connection for serverless)
let dbConnected = false;
app.use(async (req, res, next) => {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
        } catch (error) {
            console.error('Database connection failed:', error.message);
            return res.status(500).json({
                message: 'Database connection failed',
                error: error.message,
                hasDbUri: !!process.env.DB_URI,
                dbUriLength: process.env.DB_URI ? process.env.DB_URI.length : 0
            });
        }
    }
    next();
});

// Basic route
app.get('/', (req, res) => {
    res.send('PEC Event Management API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
