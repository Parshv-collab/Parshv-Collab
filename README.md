# Signal Atelier Portfolio

Signal Atelier is a React, Express, MongoDB, and GridFS developer portfolio designed for independent Render deployment. Public content, editing changes, contact submissions, and uploaded media persist in MongoDB so every visitor sees the same published source of truth.

## Run locally

Copy `.env.example` to `.env`, provide a MongoDB Atlas connection string and an admin password, then install dependencies. Run `npm run build` followed by `npm start` to mirror the production service, or run `npm run dev` during development.

## Deploying to Render

Create a free MongoDB Atlas cluster, create a database user, and copy the **Drivers** connection string. In Render, create a Node web service from this repository, set `MONGODB_URI` and `ADMIN_PASSWORD` in the Environment tab, use `npm run build` as the build command, and use `npm start` as the start command. Render supplies `PORT` automatically. Use an Atlas network access rule that permits the Render service, then open `/admin` and sign in with the configured password. The server loads a local `.env` file through `dotenv/config` for local development; production values remain in Render’s environment configuration.

## Content workflow

The owner updates all public content through `/admin`. Site edits are password-protected on the client and independently verified server-side for every content, inbox, and media mutation. Uploaded project, profile, résumé, and hero assets use MongoDB GridFS and are served from `/api/media/:id`. Content, case studies, writing, availability, recommendations, contact inbox records, and the five-minute GitHub response cache all live in MongoDB, so every visitor receives the same saved portfolio data after Render deployment.

For a direct environment-specific Atlas check, run `RUN_MONGODB_INTEGRATION=true pnpm vitest run server/mongo.integration.test.ts` from a machine or deployment runtime that has network access to your Atlas cluster. The Content Studio also displays the current server-side MongoDB connection state and can refresh that status on demand.

The measured local production audit, bundle split, known deployment caveat, and final-URL rerun guidance are recorded in [`PERFORMANCE_AUDIT.md`](./PERFORMANCE_AUDIT.md).
