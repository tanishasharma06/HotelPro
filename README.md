# HotelPro

A MERN-stack hotel booking and management system. Guests search for rooms by date and book them; staff run check-ins and check-outs; admins manage rooms and see revenue.

## Features
- JWT authentication with three roles: guest, staff, admin
- Room search filtered by dates, guests and room type, showing only rooms free for the whole stay
- Double-booking prevention on the server
- Guest booking history with cancellation
- Staff dashboard: check-in, check-out, cancel, occupancy and revenue stats
- Admin room management: add, edit, remove

## Tech stack
React (Vite), React Router, Bootstrap 5, Axios, Node.js, Express, MongoDB with Mongoose, JSON Web Tokens, bcrypt

## Getting started

You need *Node.js 18+* and *MongoDB* (local or a free MongoDB Atlas cluster).

### 1. Start the API (Backend)

bash
cd server
npm install


Create a .env file inside the server folder and add the following:

env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173


Replace the placeholder values with your own MongoDB connection string and a long, random JWT secret.

Then run:

bash
npm run seed
npm run dev


The API will run at [http://localhost:5000](http://localhost:5000).

*Note:* The seed command deletes existing users, rooms, and bookings in the connected database before inserting demo data. Use it only with a fresh or disposable development database.

### 2. Start the Client (Frontend)

Open a *new terminal* and run:

bash
cd client
npm install
npm run dev

## Demo accounts (after seeding)
| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@hotelpro.com | admin123 |
| Staff | staff@hotelpro.com | staff123 |
| Guest | guest@hotelpro.com | guest123 |

## API overview
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | logged in |
| GET | /api/rooms, /api/rooms/:id | public |
| POST/PUT/DELETE | /api/rooms | admin |
| POST | /api/bookings | logged in |
| GET | /api/bookings/mine | logged in |
| PATCH | /api/bookings/:id/cancel | owner, staff, admin |
| GET | /api/bookings, /api/bookings/stats/summary | staff, admin |
| PATCH | /api/bookings/:id/status | staff, admin |

## Ideas to extend
- Real payments with Stripe or Razorpay (see the comment in `server/routes/bookings.js`)
- Room image uploads, guest reviews, email confirmations
- Seasonal pricing and a calendar view
