const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await Registration.deleteMany();
        await Event.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed...');

        // Create users
        const createdUsersList = [];
        const userNames = [
            'K Dhanunjaya Rao',
            'Y Pavan Kumar Gupta',
            'Dr D Ramya',
            'Dr Sai Hareesh',
            'Dr V Sridhar'
        ];

        for (let i = 0; i < userNames.length; i++) {
            const user = await User.create({
                name: userNames[i],
                email: `user${i + 1}@pec.edu.in`,
                password: 'password123'
            });
            createdUsersList.push(user);
        }

        // Create a test student user
        await User.create({
            name: 'Test Student',
            email: 'student@pec.edu.in',
            password: 'password123'
        });

        console.log('Users Created...');

        // PEC College Events from Circular (Lr.No:PEC/EST/ADMIN/Feb-26, Date: 11/02/2026)
        const events = [
            // Sports Fest
            {
                name: 'PEC Sports Fest 2026 - Day 1',
                description: 'Annual Sports Fest at Pallavi Engineering College. Day 1 features cricket, volleyball, and athletics events. All departments are encouraged to participate.\n\nConvenor: K Dhanunjaya Rao\nCo-Convenor: Dr V Sridhar\n\nAll staff members and students are requested to extend their full coordination and support.',
                location: 'PEC Campus, Kuntloor, Abdullapurmet',
                date: new Date('2026-03-23T09:00:00'),
                category: 'Sports',
                capacity: 500,
                organizer: createdUsersList[0]._id
            },
            {
                name: 'PEC Sports Fest 2026 - Day 2',
                description: 'Annual Sports Fest at Pallavi Engineering College. Day 2 features basketball, badminton, kabaddi, and prize distribution ceremony.\n\nConvenor: K Dhanunjaya Rao\nCo-Convenor: Dr V Sridhar\n\nAll staff members and students are requested to extend their full coordination and support.',
                location: 'PEC Campus, Kuntloor, Abdullapurmet',
                date: new Date('2026-03-24T09:00:00'),
                category: 'Sports',
                capacity: 500,
                organizer: createdUsersList[0]._id
            },
            // Technical Fest
            {
                name: 'PEC Technical Fest 2026 - Day 1',
                description: 'Annual Technical Fest at Pallavi Engineering College. Day 1 features coding competitions, hackathon kickoff, paper presentations, and technical quiz.\n\nConvenor: Y Pavan Kumar Gupta\nCo-Convenors: M Ravi, Dr B Sathish\n\nAll staff members and students are requested to extend their full coordination and support.',
                location: 'PEC Campus, Kuntloor, Abdullapurmet',
                date: new Date('2026-03-25T09:00:00'),
                category: 'Tech',
                capacity: 300,
                organizer: createdUsersList[1]._id
            },
            {
                name: 'PEC Technical Fest 2026 - Day 2',
                description: 'Annual Technical Fest at Pallavi Engineering College. Day 2 features hackathon finals, robotics showcase, project exhibition, and valedictory ceremony.\n\nConvenor: Y Pavan Kumar Gupta\nCo-Convenors: M Ravi, Dr B Sathish\n\nAll staff members and students are requested to extend their full coordination and support.',
                location: 'PEC Campus, Kuntloor, Abdullapurmet',
                date: new Date('2026-03-27T09:00:00'),
                category: 'Tech',
                capacity: 300,
                organizer: createdUsersList[1]._id
            },
            // Cultural Fest
            {
                name: 'PEC Cultural Fest 2026',
                description: 'Annual Cultural Fest at Pallavi Engineering College. Features dance performances, singing competitions, fashion show, drama, and art exhibitions.\n\nConvenor: Dr D Ramya\n\nAll staff members and students are requested to extend their full coordination and support.',
                location: 'PEC Campus, Kuntloor, Abdullapurmet',
                date: new Date('2026-03-27T14:00:00'),
                category: 'Music',
                capacity: 600,
                organizer: createdUsersList[2]._id
            },
            // Annual Day
            {
                name: 'PEC Annual Day 2026',
                description: 'Annual Day celebration at Pallavi Engineering College. Features chief guest address, student achievements recognition, cultural performances, and awards ceremony for AY 2025-2026.\n\nConvenor: Dr Sai Hareesh\nCo-Convenor: D Navya\n\nAll staff members and students are requested to extend their full coordination and support.',
                location: 'PEC Campus, Kuntloor, Abdullapurmet',
                date: new Date('2026-03-28T10:00:00'),
                category: 'Other',
                capacity: 1000,
                organizer: createdUsersList[3]._id
            },
            // Additional events for variety
            {
                name: 'AI & ML Workshop',
                description: 'Hands-on workshop on Artificial Intelligence and Machine Learning. Learn about neural networks, deep learning, and real-world AI applications.\n\nOrganized by CSE (AIML) Department.',
                location: 'PEC Campus, Seminar Hall - Block A',
                date: new Date('2026-04-05T10:00:00'),
                category: 'Tech',
                capacity: 60,
                organizer: createdUsersList[4]._id
            },
            {
                name: 'Web Development Bootcamp',
                description: 'Full-stack web development bootcamp covering MERN stack (MongoDB, Express, React, Node.js). Build a real-world project in one day!\n\nOrganized by CSE Department.',
                location: 'PEC Campus, Computer Lab - Block B',
                date: new Date('2026-04-10T09:00:00'),
                category: 'Tech',
                capacity: 40,
                organizer: createdUsersList[1]._id
            },
            {
                name: 'Inter-College Cricket Tournament',
                description: 'Inter-college cricket tournament featuring teams from colleges across Telangana. Knockout format with semifinals and finals.',
                location: 'PEC Cricket Ground, Kuntloor',
                date: new Date('2026-04-15T08:00:00'),
                category: 'Sports',
                capacity: 200,
                organizer: createdUsersList[0]._id
            },
            {
                name: 'Startup Idea Pitch',
                description: 'Present your startup ideas to a panel of industry experts and investors. Top 3 ideas will receive mentorship and incubation support from PEC Entrepreneurship Cell.',
                location: 'PEC Campus, Auditorium',
                date: new Date('2026-04-20T10:00:00'),
                category: 'Business',
                capacity: 80,
                organizer: createdUsersList[3]._id
            },
            {
                name: 'Cybersecurity Awareness Seminar',
                description: 'Learn about cyber threats, ethical hacking, secure coding practices, and how to protect your digital identity. Guest speaker from the IT industry.',
                location: 'PEC Campus, Seminar Hall - Block C',
                date: new Date('2026-04-25T11:00:00'),
                category: 'Tech',
                capacity: 100,
                organizer: createdUsersList[4]._id
            },
            {
                name: 'Music Night',
                description: 'An evening of live music performances by PEC students and guest bands. Genres include rock, classical, and Bollywood hits.',
                location: 'PEC Campus, Open Air Amphitheatre',
                date: new Date('2026-03-26T18:00:00'),
                category: 'Music',
                capacity: 400,
                organizer: createdUsersList[2]._id
            },
            // Past event for testing
            {
                name: 'Orientation Day 2025',
                description: 'Orientation day for new batch of engineering students. Welcome address by the Principal, department introductions, and campus tour.',
                location: 'PEC Campus, Main Auditorium',
                date: new Date('2025-08-01T10:00:00'),
                category: 'Other',
                capacity: 800,
                organizer: createdUsersList[3]._id
            }
        ];

        await Event.create(events);

        console.log('Data Imported!');
        console.log('\nTest Accounts:');
        console.log('  Faculty: user1@pec.edu.in / password123');
        console.log('  Student: student@pec.edu.in / password123');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Registration.deleteMany();
        await Event.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
