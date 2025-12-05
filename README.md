SkillSwap

SkillSwap is a hyperlocal peer-to-peer platform that connects people who want to learn a skill with those who can teach it. The application is built using the MERN stack (MongoDB, Express, React, Node) and provides features for listing skills, booking sessions, messaging, rating, and real-time notifications.

Project Overview

SkillSwap enables users to offer and request skill-based sessions locally. It emphasizes simplicity, discoverability, and trust: users can create skill listings, schedule sessions, make bookings, and leave reviews. The platform supports authentication ( Google), real-time notifications for session updates, and a lightweight messaging system for students and tutors to coordinate.

Tech Stack

Frontend: React, React Router, Axios, Tailwind CSS (or chosen CSS solution)

Backend: Node.js, Express.js

Database: MongoDB (Mongoose ODM)

Authentication: JWT, Google OAuth (Passport.js or custom), OTP via SMS/email (provider of choice)

Realtime: Socket.IO (or Firebase Realtime / Pusher)



Architecture

SkillSwap follows a modular MERN architecture:

Client (React) — presentation, routing, API calls, local state management

Server (Express) — RESTful API, authentication, validation, business logic

Database (MongoDB) — collections for Users, Listings, Bookings, Reviews, Messages

Realtime Layer — Socket server for notifications and chat