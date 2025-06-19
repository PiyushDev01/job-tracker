# Job Tracker - Track Your Job Applications

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## Overview

Job Tracker is a full-stack web application designed to help job seekers track and manage their job applications throughout the job search process. It provides a centralized platform to monitor application statuses, keep notes, and visualize your job search progress.

This application allows users to:
- Store and organize job application details
- Track application status changes
- Receive notifications on status updates
- View statistics about your job search journey
- Access job information across multiple devices

## Features

### User Authentication
- Secure registration and login system
- JWT-based authentication
- Password hashing and security

### Job Management
- Create, read, update, and delete job applications
- Track key job details:
  - Company name
  - Position
  - Location
  - Salary
  - Application status
  - Application date
  - Custom notes

### Status Tracking
- Track applications through different stages:
  - Applied
  - Interview
  - Offer
  - Rejected
  - Accepted

### Dashboard & Analytics
- Visual dashboard of application statuses
- Statistics on job search progress
- Filter and search functionality

### Notification System
- Real-time notifications for status updates
- Cross-device notification synchronization
- Notification history in dropdown menu

### Responsive Design
- Mobile-friendly interface
- Adaptive layout for various screen sizes
- Optimized user experience across devices

## Demo

- Live Demo: [https://job-tracker-elite.vercel.app/](https://job-tracker-elite.vercel.app/)
- Backend API: [https://jobtrackerbackend.vercel.app/](https://jobtrackerbackend.vercel.app/)

## Tech Stack

### Frontend
- **React.js** - JavaScript library for building user interfaces
- **React Router** - For client-side routing
- **Context API** - For state management
- **Socket.io Client** - For real-time notifications
- **TailwindCSS** - For responsive styling
- **Lucide React** - For modern icons
- **Date-fns** - For date formatting and manipulation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - For real-time communication
- **JWT** - For secure authentication
- **bcrypt.js** - For password hashing

## Installation

### Prerequisites
- Node.js (v14.x or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/job-tracker.git
cd job-tracker
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create environment variables file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB URI and JWT secret:
```
MONGO_URI=mongodb://127.0.0.1:27017/jobTracker
JWT_SECRET=your_jwt_secret
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Create environment variables file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your backend URL:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3001`

## Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://127.0.0.1:27017/jobTracker
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Usage

### Registration & Login
1. Create a new account with your email and password
2. Login with your credentials
3. Upon successful login, you'll be redirected to the dashboard

### Dashboard
- View overview statistics of your job applications
- Access all job applications
- Use filters to sort applications by status, date, etc.

### Managing Job Applications
1. Click "Add New Job" to create a new job application entry
2. Fill in the job details form and submit
3. View, edit or delete existing applications from the dashboard
4. Click on a job card to view detailed information

### Notifications
- Real-time notifications appear in the notification dropdown
- Click the bell icon to view all notifications
- Clear notifications individually or all at once

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/verify` - Verify JWT token

### Jobs Endpoints
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job by ID
- `DELETE /api/jobs/:id` - Delete job by ID
- `GET /api/jobs/stats` - Get job statistics

## Deployment

### Frontend Deployment (Vercel)
1. Fork or clone the repository
2. Connect your GitHub repository to Vercel
3. Configure environment variables:
   - `VITE_API_URL=https://your-backend-url.com/api`
4. Deploy the project

### Backend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend-url.com`
   - `CORS_ENABLED=true`
3. Configure the build settings:
   - Build Command: `npm install`
   - Output Directory: [``]( )
   - Install Command: `npm install`
4. Deploy the project

## Project Structure

```
job-tracker/
├── backend/                # Backend Node.js application
│   ├── config/             # Configuration files
│   │   └── database.js     # MongoDB connection setup
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   └── cors.js         # CORS middleware
│   ├── models/             # Mongoose models
│   │   ├── Job.js          # Job model definition
│   │   └── User.js         # User model definition
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   └── jobs.js         # Job management routes
│   ├── .env                # Environment variables
│   └── server.js           # Entry point
│
├── frontend/               # Frontend React application
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── components/     # React components
│       │   ├── JobCard.jsx         # Job card component
│       │   ├── Layout.jsx          # App layout component
│       │   └── Notifications.jsx    # Notifications component
│       ├── contexts/       # React contexts
│       │   ├── AuthContext.jsx     # Authentication context
│       │   └── NotificationContext.jsx # Notifications context
│       ├── pages/          # Page components
│       │   ├── Dashboard.jsx       # Dashboard page
│       │   ├── JobDetails.jsx      # Job details page
│       │   ├── JobForm.jsx         # Job form page
│       │   ├── Login.jsx           # Login page
│       │   └── Register.jsx        # Registration page
│       ├── services/       # API services
│       │   └── api.js              # API request handlers
│       ├── utils/          # Utility functions
│       │   └── currencyConverter.js # Currency conversion utility
│       ├── App.jsx         # Root component
│       └── main.jsx        # Entry point
│
└── README.md               # Project documentation
```

## Future Enhancements

- **Advanced Filter & Search** - More robust filtering options
- **Calendar Integration** - Add interview scheduling with calendar integration
- **Email Notifications** - Send email alerts for status changes
- **Document Storage** - Store resumes and cover letters
- **Job Recommendations** - AI-powered job recommendations
- **Application Deadline Reminders** - Notifications for upcoming deadlines
- **Data Import/Export** - Import/export job application data
- **Mobile App** - Native mobile applications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ by [Piyush Vishwakarma](https://github.com/PiyushDev01)