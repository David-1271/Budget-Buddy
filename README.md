# Budget Buddy - Personal Finance Manager

## Mini-Assignment #2: Frontend Completion & Backend Setup

This project implements a personal finance management application with role-based access control. For Mini-Assignment #2, we focused on creating functional pages, setting up backend infrastructure, connecting frontend to backend, and implementing role-based access control.

### Features Implemented

#### Frontend
- **5 Functional Pages**:
  1. Home/Landing Page
  2. User Login Page
  3. User Signup Page
  4. Budget Planner Page (New)
  5. Transaction History Page (New)

- **React Router** for navigation between pages
- **API Integration** with backend services
- **Role-Based UI** that changes based on user permissions
- **Responsive Design** for different screen sizes

#### Backend
- **Node.js and Express** server setup
- **Authentication System** with login/signup endpoints
- **API Endpoints** for transactions, budgets, and dashboard data
- **Role-Based Access Control** with admin/user roles
- **Mock Data** for demonstration purposes

### Getting Started

#### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with `PORT=5000`
4. Start the server: `npm run dev`

#### Frontend Setup
1. Navigate to the frontend directory: `cd frontend/NM_15_Front_End`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Testing Credentials

**Admin User**:
- Email: admin@example.com
- Password: admin123

**Regular User**:
- Email: user@example.com
- Password: user123

### Project Structure
```
NM_15/
├── backend/           # Node.js/Express server
│   ├── server.js      # Main server file with API routes
│   ├── package.json   # Dependencies
│   └── .env          # Environment variables
└── frontend/         # React application
    └── NM_15_Front_End/
        ├── src/
        │   ├── components/ # React components
        │   ├── api/        # API service module
        │   └── App.jsx     # Main application router
        └── package.json
```

### GitLab Issue and Branch
- **Issue**: Implement Budget Planner and Transaction History Pages
- **Branch**: 3-budget-transactions-features
- **Milestone**: Mini-Assignment #2

### Core Objectives Met
1. ✅ 4+ functional pages with UI logic and meaningful interactions
2. ✅ Backend setup with Node.js and Express
3. ✅ API endpoints returning mock data
4. ✅ Frontend-backend connection with API calls
5. ✅ Smooth navigation with React Router
6. ✅ Role-based authentication with login and role return
7. ✅ Role-based UI behavior (different landing pages, navigation, page blocking)
8. ✅ Evidence of frontend-backend communication

For detailed documentation, see: `Documents/Mini-Assignment-2/Mini-Assignment-2-Implementation.txt`

# Final Project – [Project Title]

## Table of Contents

- [Introduction](#introduction)
- [Project Description](#project-description)
- [File Structure](#file-structure)
- [Code & Logic](#code--logic)
- [Screenshots](#screenshots)
- [Setup](#setup)
- [Contributions](#contributions)
- [API Setup](#api-setup)

## Introduction

Short overview of the problem, purpose, users, and goals.  
Mention if the project is original or inspired by something.

## Project Description

Summarize main features, user flow, and CRUD operations.

## File Structure

```
frontend/
backend/
Documents/
```

## Code & Logic

Explain briefly:

- How the frontend communicates with the backend
- How the database is used
- Include a few small code snippets (component, route, or DB logic)

## Screenshots

Add 4 screenshots (2 per member) with short captions describing each page.

## Setup

Steps to run the app:

1. `npm install`
2. Add `.env` file
3. `npm run dev`

## Contributions

List each member’s work.  
Example:

- Member 1 – Frontend + Backend (Feature 1, Feature 2)
- Member 2 – Frontend + Backend (Feature 3, Feature 4)

## API Setup

If your project uses external APIs (for example: OpenAI, Google Maps, or Weather API), include clear instructions for each one.

For every API used:

1. Explain how to sign up on the provider’s website.
2. Describe how to create or generate an API key.
3. If the API is paid or has usage limits, clearly mention that.
4. Note any extra steps needed (like enabling specific services, adding billing info, or setting access permissions).
5. Add where and how the key should be stored (for example, in the `.env` file).
