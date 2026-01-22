# Event Tickets 

Sell tickets for a range of events, including concerts, sporting events, cooking classes and presentations, among many more. Takes in customer details and order info via a form, stores in database on backend.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Development](#development)
- [License](#license)

## Features

- Customer registration with full contact details
- Browse events by type (concerts, sports, theater, etc.)
- View event details including date, time, location, and pricing
- Purchase multiple tickets per order
- Real-time order summary with total calculation
- Persistent data storage with SQLite database

## Tech Stack

**Backend:**
- Node.js with Express.js
- SQLite3 database
- RESTful API architecture

**Frontend:**
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- Responsive design

## Installation
```bash
# Clone the repository
git clone https://github.com/Drennan98/EventTickets.git
cd EventTickets

# Install dependencies
cd backend
npm install
```

## Usage
```bash
# Start the server (from backend directory)
npm start

# The application will run at
http://localhost:3000
```

## Project Structure
```
EventTickets/
├── backend/
│   ├── server.js           # Express server and API routes
│   ├── package.json        # Node dependencies
│   └── package-lock.json
├── frontend/
│   ├── index.html          # Customer registration form
│   ├── tickets.html        # Event selection and ordering
│   ├── tickets.js          # Client-side logic
│   └── styles.css          # Application styles
└── EventTicket.db          # SQLite database
```

## API Endpoints

- `POST /submit` - Create new customer
- `GET /event-types` - Fetch all event types
- `GET /events?eventTypeId={id}` - Fetch events by type
- `POST /orders` - Create new order
- `GET /customers` - Fetch all customers

## Database Schema

The application uses four main tables:
- **Customer** - Stores customer information
- **Event_Type** - Event categories
- **Event** - Event details with pricing
- **Location** - Venue information
- **Order** - Ticket orders


## Development

The application follows a simple two-page flow:
1. Customer enters their details on `index.html`
2. Customer is redirected to `tickets.html` to select events and purchase tickets
3. Order confirmation is displayed with complete summary

## License

This project is private and not licensed for public use.

---

**Note:** Ensure the SQLite database file (`EventTicket.db`) is in the project root directory before starting the server.