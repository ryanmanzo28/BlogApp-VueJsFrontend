# HydraCor Blog

A minimal full-stack blog application with JWT authentication and ownership-based post editing.

## Tech Stack

- **Frontend**: Vue.js + Vite (static HTML pages)
- **API Gateway**: Express.js (Node.js)
- **Backend**: CakePHP 4
- **Database**: MariaDB
- **Auth**: JWT (JSON Web Tokens)

## Quick Start

```bash
./starter.sh
```

Runs Docker Compose to start all services. Frontend available at `http://localhost:8765`.

## Features

- **Auth**: JWT-based login/signup with bcrypt password hashing
- **CRUD**: Create, read, update (owner-only), delete (owner-only) posts
- **Composing**: Live preview, autosave drafts, publish posts
- **Reading**: Public feed, article detail with post numbering
- **Profile**: User dashboard with recent posts and session info

## Key Endpoints

- `GET /api/posts` - Public read (no auth)
- `POST /api/posts` - Create (auth required)
- `PUT /api/posts/:id` - Update (auth + owner required)
- `DELETE /api/posts/:id` - Delete (auth + owner required)
- `POST /api/login` - Login (returns JWT)
- `POST /api/signup` - Register (returns JWT)

## Architecture

- Frontend proxy (Express) handles auth and routes requests to backend
- Backend CakePHP instance provides read-only `/posts` endpoint
- Direct database writes for create/update/delete happen in Express layer
- All writes require valid JWT token and enforce ownership

## Running Tests

```bash
docker compose exec frontend npm test
docker compose exec backend ./bin/cake test
```
