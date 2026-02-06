# Budget Buddy Backend

This folder contains the server-side code for the Budget Buddy application. It provides the API endpoints used by the frontend, handles business logic, and manages data operations. The backend is built with Node.js and Express, and includes authentication routes, finance data endpoints, and role-based access control.

## Features Implemented

- **Authentication System**: Login and signup routes with role-based access (admin/user)
- **API Endpoints**: For transactions, budgets, and dashboard statistics
- **Mock Data**: Sample data for demonstration purposes
- **Role-Based Access**: Different responses based on user roles

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root of the backend directory with the following variables:
```env
PORT=5000
NODE_ENV=development
```

### Running the Server
- Development mode (with nodemon):
```bash
npm run dev
```

- Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user and return role
- `POST /api/auth/signup` - Register new user (non-admin only)

### Finance Data
- `GET /api/transactions` - Get all transactions (mock data)
- `POST /api/transactions` - Add new transaction
- `GET /api/budgets` - Get budget information
- `GET /api/dashboard/stats` - Get dashboard statistics

## Environment Variables

- `PORT` - Port number for the server (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

## Project Structure

```
backend/
├── server.js         # Main server file with routes
├── package.json      # Dependencies and scripts
├── .env             # Environment variables
└── README.md        # This file
```
