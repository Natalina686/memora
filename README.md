# Memora

Memora is an AI-powered personalized learning system developed as a Master's diploma project.

The main idea of the project is to treat a **Knowledge** entity as the central unit of learning instead of a flashcard or a test question. A single Knowledge can be used to generate different questions, while learning progress and spaced repetition are maintained for the Knowledge itself.

## Main Features

* JWT authentication
* learner profiles
* knowledge collections
* AI-based knowledge structuring
* Human-in-the-loop approval of structured knowledge
* automatic AI question generation
* Human-in-the-loop approval of generated questions
* quiz sessions
* server-side answer evaluation
* learning progress tracking
* SM-2 based spaced repetition
* review scheduling
* Telegram notification module
* account-level resource ownership checks

## Main Learning Flow

```text
User Input
    ↓
AI Structure
    ↓
Knowledge Preview
    ↓
User Approval
    ↓
Knowledge
    ↓
AI Question Generation
    ↓
Question Preview
    ↓
User Approval
    ↓
Questions
    ↓
QuizSession
    ↓
Answers
    ↓
Quiz Completion
    ↓
Aggregate Answers by Knowledge
    ↓
LearningProgress
    ↓
SM-2
    ↓
ReviewSchedule
    ↓
Due Knowledge becomes available for review
```

AI is responsible for preparing learning content, while spaced repetition is handled by deterministic backend business logic.

## Human-in-the-Loop

AI output is not automatically treated as trusted learning data.

Memora uses two approval stages:

1. The user reviews structured Knowledge before it is persisted.
2. The user reviews generated questions and their correct answers before Questions are persisted.

AI operations are recorded in `AIProcessingLog`.

## Technology Stack

### Backend

* Node.js
* TypeScript
* NestJS
* Prisma ORM
* PostgreSQL
* OpenAI API
* Telegram Bot API
* JWT
* Jest

### Frontend

* React
* TypeScript
* Vite

### Infrastructure

* Docker Compose
* PostgreSQL 17
* GitHub

## Production Deployment

The MVP is deployed and publicly available.

- Frontend: Vercel
- Backend: Railway
- Database: PostgreSQL on Railway
- External AI service: OpenAI API

### Live Demo

Frontend:
https://memora-frontend-beta.vercel.app

Backend health endpoint:
https://memora-production-dd9b.up.railway.app/api/v1

## Architecture

The application is implemented as a **Modular Monolith**.

Backend functionality is divided into domain-oriented NestJS modules:

```text
Auth
Learners
KnowledgeCollections
Knowledge
AI
AIProcessingLogs
Questions
QuizSessions
Answers
LearningProgress
ReviewSchedule
Notifications
```

Controllers handle HTTP requests, services contain business logic, and Prisma provides access to PostgreSQL.

Architecture decisions are documented in:

```text
docs/adr/
```

## Domain Model

The main relationships are:

```text
Account
  ↓
Learner
  ↓
KnowledgeCollection
  ↓
Knowledge
  ↓
Question

Learner
  ↓
QuizSession
  ↓
Answer
  ↓
Question
  ↓
Knowledge

Learner + Knowledge
  ↓
LearningProgress
  ↓
ReviewSchedule
```

The key architectural decision is that `LearningProgress` belongs to a combination of Learner and Knowledge rather than to an individual Question.

## Spaced Repetition

Memora uses an adapted SM-2 algorithm.

Current rules:

* initial E-Factor: `2.5`
* minimum E-Factor: `1.3`
* first successful repetition: `1 day`
* second successful repetition: `6 days`
* later intervals: previous interval × E-Factor
* incorrect answer resets repetition to `0`
* incorrect answer schedules the next review after `1 day`

SM-2 is applied once per Knowledge when a QuizSession is completed.

If several Questions belong to the same Knowledge, their Answers are grouped first. The Knowledge review is considered successful when the number of correct answers is greater than the number of incorrect answers.

This prevents several Questions for the same Knowledge from being incorrectly interpreted as several independent spaced-repetition reviews.

The current MVP maps:

```text
correct answer   → q = 4
incorrect answer → q = 2
```


## Security

Protected API endpoints use JWT authentication.

Resource access is additionally restricted by account ownership. Knowing another resource UUID is not sufficient to access it.

Ownership checks are implemented for important resources including:

* Learner
* KnowledgeCollection
* Knowledge
* QuizSession
* Answer
* LearningProgress
* AIProcessingLog

`AIProcessingLog` is created internally by the AI service and is not exposed through a public create endpoint.

## Project Structure

```text
memora/
├── backend/
│   ├── prisma/
│   ├── scripts/
│   ├── src/
│   └── test/
│
├── frontend/
│   └── src/
│
├── docs/
│   └── adr/
│
├── docker-compose.yml
└── README.md
```

## Local Development

### Requirements

* Node.js 22+
* npm
* Docker
* Docker Compose

### 1. Clone repository

```bash
git clone https://github.com/Natalina686/memora.git
cd memora
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Configure backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
```

Add the required values to `.env`.

### 4. Start backend

```bash
npm run start:dev
```

Backend API:

```text
http://localhost:3000/api/v1
```

### 5. Configure frontend

```bash
cd ../frontend
cp .env.example .env
npm install
```

### 6. Start frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Testing

Backend:

```bash
cd backend

npm run build
npm run lint
npm test -- --runInBand
npm run test:cov -- --runInBand
```

Final automated test result:

```text
Test Suites: 5 passed, 5 total
Tests:       37 passed, 37 total
```

Measured backend coverage:

| Metric     | Coverage |
| ---------- | -------: |
| Statements |   22.77% |
| Branches   |   18.23% |
| Functions  |   14.06% |
| Lines      |   22.78% |

Frontend validation:

```bash
cd frontend

npm run build
npm run lint
```

## Performance Test

A local API performance script is available in:

```text
backend/scripts/api-performance.mjs
```

The final load test for `Learning Progress` used:

```text
Requests:     200
Concurrency:  10
Successful:   200
Errors:       0
Average:      47.53 ms
P95:          79.09 ms
Throughput:   208.79 requests/s
```

These measurements were obtained in a local development environment and should not be interpreted as production SLA values.

## Current Limitations

The current version is an MVP.

Known limitations include:

* `Answer`, `LearningProgress` and `ReviewSchedule` updates are not yet executed in one Prisma transaction;
* `MULTIPLE_CHOICE` answer comparison should use type-specific normalization;
* automatic creation of a `Notification` from `ReviewSchedule` is not yet implemented;
* automated test coverage should be expanded;
* production-like performance testing has not yet been performed;

## Future Development

Planned improvements:

1. transactional answer/progress/review updates;
2. automatic `ReviewSchedule → Notification` flow;
3. improved answer normalization;
4. expanded integration and end-to-end testing
5. production deployment and monitoring;
6. comparison of SM-2 with FSRS after enough learning history is collected.

## Diploma Project

**Title:**
Development of an Information System for Personalized Learning Based on Generative Artificial Intelligence and Spaced Repetition Algorithms

**Author:** Nataliia Tkach

**Program:** Master of Science in Computer Science

## Status

**MVP implemented and validated.**

The main user flow, automated tests, security checks, code coverage measurement, API performance testing and final end-to-end scenario have been completed.
