Memora Frontend

React frontend for the Memora personalized learning system.

Stack
React
TypeScript
Vite
REST API
Main User Flow

The frontend supports:

authentication;
learner display;
Knowledge Collection management;
entering personal learning information;
AI Knowledge preview and approval;
AI Question preview and approval;
QuizSession;
Learning Progress;
spaced repetition information and next review date.
Setup
npm install
cp .env.example .env
npm run dev

Default local frontend:

http://localhost:5173

Default local backend:

http://localhost:3000/api/v1
Validation
npm run build
npm run lint
Environment

The backend URL is configured through:

VITE_API_URL

Example:

VITE_API_URL=http://localhost:3000/api/v1