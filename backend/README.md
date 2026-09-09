# Memora Backend

NestJS backend for the Memora personalized learning system.

## Stack

* Node.js
* TypeScript
* NestJS
* PostgreSQL
* Prisma ORM
* OpenAI API
* Telegram Bot API
* JWT
* Jest

## Main Modules

```text
Auth
Accounts
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

## Setup

```bash
npm install
cp .env.example .env

npx prisma generate
npx prisma migrate dev

npm run start:dev
```

Default API URL:

```text
http://localhost:3000/api/v1
```

## Validation

```bash
npm run build
npm run lint
npm test -- --runInBand
npm run test:cov -- --runInBand
```

Current automated test result:

```text
37 tests passed
5 test suites passed
```

## Prisma

Create a migration:

```bash
npx prisma migrate dev --name migration_name
```

Generate Prisma Client:

```bash
npx prisma generate
```

Production migrations:

```bash
npx prisma migrate deploy
```

## Performance Testing

```bash
TOKEN="$TOKEN" node scripts/api-performance.mjs
```

The script measures sequential latency and basic concurrent load without calling the external OpenAI API.

## Architecture

The backend is implemented as a modular monolith.

HTTP controllers are kept separate from service-level business logic. Prisma is used for persistence, while external integrations such as OpenAI and Telegram are isolated in dedicated modules.
