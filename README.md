# React + Vite
# Micro-Savings Frontend

Frontend application for the Micro-Savings wallet management system built with React, Vite, and Tailwind CSS.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/micro-savings-frontend.git
cd micro-savings-frontend
```

2. Install dependencies
```bash
npm install
```

## Running the Application

### Development
```bash
npm run dev

```
 create a .env file and paste this
 
Open http://localhost:5173 in your browser.

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── UserInterface.jsx
│   └── AdminDashboard.jsx
├── App.jsx
├── main.jsx
└── index.css
```
```env
REACT_APP_API_BASE_URL= http://localhost:3000
```
## Features

- User wallet management (deposit, transfer, withdraw)
- Admin dashboard with analytics
- Transaction history and filtering
- Real-time balance updates

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Recharts
- Lucide React Icons
