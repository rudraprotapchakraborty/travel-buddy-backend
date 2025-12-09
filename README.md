# Travel Buddy & Meetup — Backend

Live URL: [https://travel-buddy-backend-y049.onrender.com/](https://travel-buddy-backend-y049.onrender.com/)

---

## 🚀 Project Overview

This repository contains the **backend** for the Travel Buddy & Meetup platform. The backend provides authentication, user & profile management, travel plan CRUD, matching/search, reviews, and payment integration endpoints which the frontend consumes.

> The server at the live URL responds with a basic health message: `Travel Buddy Backend Running.`

---

## 🧭 API — High-level Endpoints (expected)

These are the backend endpoints the frontend expects. Adjust or expand them to match your implementation.

| Method | Endpoint                      | Purpose                                                                           |
| ------ | ----------------------------- | --------------------------------------------------------------------------------- |
| POST   | `/api/auth/register`          | Register new user                                                                 |
| POST   | `/api/auth/login`             | Login user (returns JWT or sets cookie)                                           |
| GET    | `/api/users/:id`              | Get user profile                                                                  |
| PATCH  | `/api/users/:id`              | Update profile                                                                    |
| POST   | `/api/travel-plans`           | Create travel plan                                                                |
| GET    | `/api/travel-plans`           | Get all travel plans                                                              |
| GET    | `/api/travel-plans/:id`       | Get travel plan by id                                                             |
| GET    | `/api/travel-plans/match`     | Search & match travelers (query params: destination, dateFrom, dateTo, interests) |
| PATCH  | `/api/travel-plans/:id`       | Update travel plan                                                                |
| DELETE | `/api/travel-plans/:id`       | Delete travel plan                                                                |
| POST   | `/api/reviews`                | Add review                                                                        |
| GET    | `/api/reviews/:userId`        | Get reviews for a user                                                            |
| POST   | `/api/payments/create-intent` | Create payment intent (Stripe/other)                                              |

---

## ⚙️ Recommended Tech Stack (replace if different)

* **Runtime:** Node.js (v16+)
* **Framework:** Express.js or Fastify
* **Database:** MongoDB (Mongoose) or PostgreSQL (Prisma / TypeORM)
* **Authentication:** JWT (access & refresh tokens) or session cookies
* **Storage:** Cloudinary / S3 for images
* **Payments:** Stripe (recommended) or local gateway
* **Deployment:** Render / Heroku / Vercel (server) — currently deployed on Render.

> If your project uses a different stack, swap these sections and examples accordingly.

---

## 🔐 Authentication & Roles

* Register and login endpoints should issue a JWT (or set an HttpOnly cookie) for secure authentication.
* Roles: `user` and `admin`. Protect admin routes with role-check middleware.
* Passwords must be hashed using bcrypt (or an equivalent secure hashing function).

---

## 🧾 Environment Variables

Create a `.env` file in the project root. Example variables (edit to match your code):

```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/travel-buddy
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud_name>
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=https://travel-buddy-frontend-lake.vercel.app
```

> Only add variables your code actually uses. Never commit `.env` to source control.

---

## 🛠️ Local Setup & Development

1. Clone the repo:

```bash
git clone <repo-url>
cd travel-buddy-backend
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn
```

3. Create `.env` using the example above.

4. Start the dev server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The health endpoint is available at: `https://travel-buddy-backend-y049.onrender.com/` and should return a simple success message.

---

## 🧩 Database & Migrations

* For MongoDB: ensure `MONGO_URI` points to a running MongoDB cluster. Use Mongoose models in `/src/models`.
* For SQL (Postgres): set `DATABASE_URL` and use Prisma or TypeORM with migration scripts. Example for Prisma:

```bash
npx prisma migrate dev --name init
```

---

## 🔁 Sample Requests

Below are example `curl` requests. Adapt headers/token locations to your auth implementation.

**Register**

```bash
curl -X POST https://travel-buddy-backend-y049.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "Alice", "email": "alice@example.com", "password": "Passw0rd" }'
```

**Login**

```bash
curl -X POST https://travel-buddy-backend-y049.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "alice@example.com", "password": "Passw0rd" }'
```

**Create travel plan** (requires auth token)

```bash
curl -X POST https://travel-buddy-backend-y049.onrender.com/api/travel-plans \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{ "destination": "Kathmandu, Nepal", "startDate": "2026-03-15", "endDate": "2026-03-22", "budget": "500-1000", "travelType": "Solo" }'
```

---

## ✅ Testing

* Add unit tests (Jest) for controllers and integration tests for routes.
* For end-to-end testing consider using Supertest + an in-memory DB (e.g., MongoDB Memory Server) to avoid touching production data.

---

## 🔒 Security Best Practices

* Use HttpOnly secure cookies or rotating refresh tokens for authentication to reduce XSS/CSRF risk.
* Rate-limit auth endpoints.
* Validate and sanitize all incoming data.
* Store secrets in Render/Cloud provider environment settings, not in the repo.

---

## 📦 Deployment (Render)

Example steps to deploy on Render (you already have a live URL):

1. Connect repository to Render.
2. Set environment variables in the Render dashboard.
3. Provide a start command such as `npm start` and choose your `PORT` if needed.
4. Enable automatic deploys from your main branch.

---

## 🤝 Contributing

Happy to accept contributions. Suggested flow:

1. Fork & create a feature branch.
2. Open PR with description and linked issue.

**Contact / Author**

Rudra Protap Chakraborty
