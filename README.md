# FitTrack Frontend

React + TypeScript + Material UI frontend for the FitTrack Enterprise Fitness Tracking platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| UI Library | Material UI (MUI) v5 |
| State Management | Redux Toolkit |
| Server State | TanStack React Query |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| HTTP Client | Axios (with interceptors) |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env

# 3. Start development server
npm run dev
```

App will be available at `http://localhost:5173`. Make sure the backend is running on `http://localhost:5000`.

## Architecture

- **Automatic token refresh** — Axios interceptors silently refresh the JWT on 401 responses
- **Protected routes** — Role-based route guards using `ProtectedRoute` component
- **Centralized API** — All API calls in `src/api/index.ts`
- **Redux** — Auth state persisted in localStorage
- **React Query** — Server state, caching, and background refetching

## Pages

| Route | Page | Auth Required |
|-------|------|--------------|
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | Dashboard with analytics | Yes |
| `/workouts` | Workout sessions | Yes |
| `/nutrition` | Nutrition logs | Yes |
| `/goals` | Goals tracker | Yes |
| `/progress` | Progress & PRs | Yes |
| `/exercises` | Exercise library | Yes |
| `/users` | User management | Admin only |
