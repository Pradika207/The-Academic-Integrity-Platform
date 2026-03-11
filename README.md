# Student Pulse - Academic Risk Detector

A modern, AI-driven academic intelligence platform designed to proactively identify students at risk.

## Features

- **Glassmorphism UI**: Beautiful, premium design with a dark mode aesthetic.
- **Real-time Stats Sync**: Fetch live data from LeetCode, Codeforces, CodeChef, GitHub, and HackerRank.
- **Academic Risk Score**: Automated risk assessment based on multiple metrics.
- **Interactive Analytics**: Visualized student performance with Recharts.

## Getting Started

### Prerequisites

- Node.js installed

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

This project consists of a React frontend and an Express backend.

1. **Start the Backend Server:**
   ```bash
   npm run server
   ```
   The backend will run on `http://localhost:5000`.

2. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will run on the default Vite port (usually `http://localhost:5173`).

## Real-time Sync Integration

To enable real-time syncing for students:
1. Ensure the backend server is running.
2. Visit the dashboard.
3. Select a student and click the **Live Sync** button.
4. The system will fetch real-time data from the social handles defined in `src/data/mockData.js`.

## Tech Stack

- **Frontend**: React, Vite, Framer Motion, Lucide React, Recharts
- **Backend**: Node.js, Express, Axios, Cheerio
- **Styling**: Vanilla CSS (Modern CSS variables and glassmorphism)
