# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Replace the four `CapabilityCard` stubs with real views that fetch via the shared `getJson` client from `src/api/client.ts`. Each page owns its loading (`role="status"`), empty, and error (`role="alert"`) states and renders the API payload directly; no new state library.
- Logic tier decision: Keep one Express route module per capability under `src/routes`, with thin handlers that delegate to small service functions. Validate input in the service layer and return deliberate 4xx responses (400 for malformed/missing fields, 404 for unknown references) so no cast error can surface as a 500.
- Data tier decision: Enforce the contract on the Mongoose models with `required: true` on `User` (name, email, fitnessGoal), `Team` (name, mascot, members), `Activity` (type, user, team, minutes, points, occurredAt), and `Workout` (title, focus, minutes, difficulty). Keep `seed.ts` idempotent so repeated runs converge on the same representative dataset.
- Activity tracking approach: `GET /api/activities` lists records; `POST /api/activities` validates that `userId` and `teamId` are well-formed ObjectIds referencing existing users and teams (400/404 otherwise), stores the submitted `user`, `team`, `type`, and `minutes`, and computes `points` (1 point per minute) and `occurredAt` (current time) server-side.
- Team management approach: `GET /api/teams` lists teams with members; `POST /api/teams` requires a `name` (400 when missing) and keeps the submitted `name` and `mascot` on created and listed teams.
- Leaderboard approach: `GET /api/leaderboard` aggregates activity points per team (Mongoose aggregation or in-memory sum over activities), orders by total points descending, and returns `{ teamName, totalPoints, rank }` with a 1-based rank.
- Workout suggestions approach: `GET /api/workouts/suggestions/:userEmail` looks up the seeded user by email (404 when absent), then matches the user's `fitnessGoal` and recent activity types against the `Workout` catalog; the first suggestion's `focus` matches the goal or recent activity and every suggestion carries a `reason` explaining the match.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Failure means a Mongoose model is missing required-field validation or the seed script is not idempotent/representative. Fix in `src/models` or `src/scripts/seed.ts` before touching other tiers.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Failure means a route/service violates the API contract (wrong status code, missing field, or a 500 from an unvalidated cast). A beforeAll hook timeout on a fresh machine usually means `mongodb-memory-server` is still downloading the MongoDB binary; re-run once the download is cached.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Failure means a page still renders the "Implementation pending" stub or is missing a loading/empty/error state. Fix the page component; the fetch stub in the test defines the expected request URLs and payloads.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Failure means a TypeScript error in the backend; resolve before pushing.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Failure means a TypeScript error in the frontend; resolve before pushing.
