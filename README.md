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
You need Node.js 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. API
cd server
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run seed              # sample rooms and demo accounts
npm run dev               # http://localhost:5000

# 2. Client (new terminal)
cd client
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

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
