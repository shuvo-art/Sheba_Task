Sheba Platform Backend
A simple service booking platform backend built with Node.js, Express, TypeScript, and PostgreSQL.
Features
Core

Service Listing API: Paginated list of services (GET /api/services).
Service Booking API: Book a service (POST /api/bookings).
Booking Status API: Check booking status (GET /api/bookings/:id).

Bonus

Admin APIs: Manage services (POST/PUT/DELETE /api/services) and view bookings (GET /api/bookings).
JWT Authentication: Secure admin endpoints.
Email Notifications: Send booking confirmation emails.
Schedule Date/Time: Included in booking API.
Dockerization: Run with Docker Compose.

Setup
Prerequisites

Node.js 18+
PostgreSQL 13+
Docker (optional)

Installation

Clone the repository:git clone <repo-url>
cd sheba-platform


Install dependencies:npm install


Create a .env file:cp .env.example .env

Edit .env with your settings:DATABASE_URL=postgres://user:password@localhost:5432/sheba
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password



Running Locally

Start PostgreSQL and create the sheba database:psql -U postgres -c "CREATE DATABASE sheba;"


Build and run:npm run build
npm start



Running with Docker

Start services:docker-compose up --build



API Documentation
User Endpoints

Register: POST /api/users/register{
  "email": "user@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to "user"
}


Login: POST /api/users/login{
  "email": "user@example.com",
  "password": "password123"
}



Service Endpoints

List Services: GET /api/services?page=1&limit=10 (public)
Create Service: POST /api/services (admin){
  "name": "Cleaning",
  "category": "Home",
  "price": 50,
  "description": "Deep cleaning"
}


Update Service: PUT /api/services/:id (admin)
Delete Service: DELETE /api/services/:id (admin)

Booking Endpoints

Create Booking: POST /api/bookings (authenticated){
  "customerName": "John Doe",
  "phoneNumber": "1234567890",
  "serviceId": 1,
  "scheduleDateTime": "2025-05-10T10:00:00Z"
}


Get Booking Status: GET /api/bookings/:id (authenticated)
List All Bookings: GET /api/bookings (admin)

Running Tests

Ensure test database is set up (NODE_ENV=test).
Run tests:npm test



Assumptions

Service listing is public; booking and admin APIs require JWT authentication.
Email notifications use nodemailer with Gmail SMTP (configure via .env).
Bookings are tied to authenticated users (guest bookings not implemented).
Unit tests cover core APIs; additional tests can be added for admin endpoints.

Folder Structure
src/
├── config/
│   └── database.ts
├── middleware/
│   └── auth.ts
├── modules/
│   ├── booking/
│   │   ├── booking.controller.ts
│   │   ├── booking.model.ts
│   │   ├── booking.routes.ts
│   │   └── booking.service.ts
│   ├── service/
│   │   ├── service.controller.ts
│   │   ├── service.model.ts
│   │   ├── service.routes.ts
│   │   └── service.service.ts
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.model.ts
│   │   ├── user.routes.ts
│   │   └── user.service.ts
│   └── notification/
│       └── notification.service.ts
├── tests/
│   ├── service.test.ts
│   └── booking.test.ts
├── app.ts
└── server.ts

