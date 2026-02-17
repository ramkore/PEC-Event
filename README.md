# PEC Event Management Application

A full-stack event management platform for Pallavi Engineering College, facilitating event discovery, user authentication, and registration management. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication**: Secure Login and Registration using JWT.
- **Event Discovery**: Browse events with search and filtering (Category, Location, Date Range).
- **Event Details**: View comprehensive event information with registration status.
- **Registration System**: Register for events, managing capacity and preventing duplicates.
- **Dashboard**: View upcoming and past registrations, with cancellation functionality.
- **Responsive Design**: Built with TailwindCSS for mobile and desktop.
- **Toast Notifications**: Interactive feedback for user actions.

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS, React Router DOM, Axios, React Toastify.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Authentication**: JSON Web Tokens (JWT), BcryptJS.

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (Local or Atlas URI)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd pec-event-management
    ```

2.  **Setup Backend:**
    ```bash
    cd server
    npm install
    ```
    - Create a `.env` file in `server/` with the following:
      ```env
      PORT=5000
      DB_URI=mongodb+srv://<your-atlas-uri>/pec_event_mgmt
      JWT_SECRET=your_super_secret_key
      ```

3.  **Setup Frontend:**
    ```bash
    cd ../client
    npm install
    ```

### Running the Application

1.  **Start the Backend:**
    ```bash
    cd server
    npm run dev
    ```
    *Server will start on http://localhost:5000*

2.  **Start the Frontend:**
    ```bash
    cd client
    npm run dev
    ```
    *Client will start on http://localhost:5173*

### Seeding Data

To populate the database with PEC college events and test users:

```bash
cd server
npm run data:import
```

**Test Accounts:**
- Faculty: `user1@pec.edu.in` / `password123`
- Student: `student@pec.edu.in` / `password123`

*Note: This will clear existing data.*

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user.
- `POST /api/auth/login` - Login and get token.

### Events
- `GET /api/events` - Get all events (Params: search, category, location, startDate, endDate, page, limit).
- `GET /api/events/:id` - Get event details.
- `POST /api/events` - Create event (Protected).

### Registrations
- `POST /api/registrations` - Register for an event (Protected).
- `GET /api/registrations/user` - Get user's registrations (Protected).
- `DELETE /api/registrations/:id` - Cancel registration (Protected).

## Folder Structure

```
root/
├── client/          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── ...
├── server/          # Node.js Backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── ...
└── README.md
```
