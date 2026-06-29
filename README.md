# Civic Connect

Civic Connect is a hyperlocal community platform designed to bridge the gap between citizens and municipal authorities. It empowers residents to report, track, and verify civic issues (such as potholes, water leaks, and damaged infrastructure) while enabling city officials to efficiently monitor and resolve them using AI-powered insights.

## Features

- **Hyperlocal Issue Reporting**: Citizens can easily log civic issues with their geolocation, descriptions, and categories.
- **AI-Powered Insights**: Integrates with Google Gemini to automatically categorize issues, assess priority, provide safety advice, and generate predictive insights based on geographic report density.
- **Community Verification**: Other users can verify reported issues, reducing false reports and helping city officials prioritize effectively.
- **Gamification & Leaderboards**: Citizens earn XP and badges (e.g., "First Reporter", "Hawk Eye") for active participation, encouraging civic engagement.
- **Dashboard & Hotspot Tracking**: City officials can view an interactive dashboard, track neighborhood hotspots, and manage the workflow pipeline of civic incidents (Reported → Verified → In Progress → Resolved).
- **Dual Roles**: Supports both `Citizen` and `Official` accounts for targeted experiences.

## Application Flows and Screenshots

For a detailed walkthrough of the application flows and visual screenshots, please refer to our documentation:
[Civic Connect Application Flows & Screenshots](https://docs.google.com/document/d/1xS9BRStbke_qViUthact9ITR8-UuM4Uy7pRGLFtwW58/edit?tab=t.0)

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React
- **Backend/API**: Express (Node.js)
- **AI Integration**: Google Gemini API
- **Build Tool**: Vite

## Getting Started

1. Set your `GEMINI_API_KEY` in the environment variables.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Pre-configured Test Accounts

You can test the application using the following built-in accounts:

**Citizens:**
- Email: `alex@example.com` | Password: `password123`
- Email: `elena@example.com` | Password: `password123`

**City Official:**
- Email: `admin@city.gov` | Password: `adminpassword` (Note: Officials require a 6-digit Official PIN like `123456` upon login).
