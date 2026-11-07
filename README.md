<div align="center">

# 🧳 Travel Buddy

**Find travel companions, share trip plans and organise meetups.**

[**Live demo**](https://travel-buddy-frontend-qzgv.vercel.app/) · [Frontend](https://github.com/rudraprotapchakraborty/travel-buddy-frontend) · [Portfolio](https://rudraprotapchakraborty.com/projects)

![Node.js](https://img.shields.io/badge/Node.js-3c873a?style=for-the-badge&logo=nodedotjs&logoColor=ffffff) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=ffffff) ![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=ffffff) ![MongoDB](https://img.shields.io/badge/MongoDB-47a248?style=for-the-badge&logo=mongodb&logoColor=ffffff) ![Stripe](https://img.shields.io/badge/Stripe-635bff?style=for-the-badge&logo=stripe&logoColor=ffffff) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=ffffff)

<a href="https://travel-buddy-frontend-qzgv.vercel.app/"><img src="https://i.ibb.co/xqdgD8GH/travel-buddy.webp" alt="Travel Buddy: home page" width="880"></a>

</div>

> The REST API of **Travel Buddy**.
>
> - Post trip plans and search other trips by destination, dates and travel style
> - Join requests that hosts accept or decline, with ratings and reviews after the trip
> - Email-verified accounts, Google sign-in and a Stripe-paid verified plan
> - Admin dashboard for members and trips

REST API for [Travel Buddy](https://travel-buddy-frontend-qzgv.vercel.app/) ([frontend repository](https://github.com/rudraprotapchakraborty/travel-buddy-frontend)): trip plans, matching, join requests, reviews, payments and accounts.

## Features

- **Trip plans** – create, read, update and delete plans; only the host (or an admin) can change one. Search by destination, dates and travel style, and a `/match` endpoint for suggestions
- **Join requests** – send a request to a trip, hosts accept or decline, and members see their own requests
- **Reviews** – list, create, edit and delete reviews; authors and admins can remove them
- **Auth** – email and password with a six digit email code, Google ID-token sign-in, forgot and reset password
- **Roles** – `USER` and `ADMIN`; the JWT is checked against the database on every request so blocks and role changes apply immediately
- **Payments** – Stripe checkout for the verified plan, confirmed through a signed webhook
- **Uploads** – profile photos through ImgBB
- **Safety** – Helmet, CORS allow-list, rate limits, Zod validation on every write, locked-down shared test accounts

## API overview

Everything lives under `/api`. Protected routes need `Authorization: Bearer <token>`.

| Area | Routes |
| --- | --- |
| Auth | `POST /auth/register`, `/login`, `/google`, `/verify-email`, `/resend-otp`, `/forgot-password`, `/reset-password`; `GET /auth/demo-accounts` |
| Users | `GET /users/me/self`, `GET /users/me/methods`, profile, email, password and delete endpoints |
| Travel plans | `POST /travel-plans`, `GET /travel-plans`, `/me`, `/match`, `/:id`, `PATCH` and `DELETE /:id` |
| Join requests | `POST` a request, `GET /join-requests/me`, `GET /join-requests/host`, accept or decline |
| Reviews | `GET /reviews`, `POST`, `DELETE /reviews/:id` |
| Payments | create a Stripe payment, webhook |
| Admin | members, trips and reviews management |
| Public | `GET /public/stats` |

## Run it locally

```bash
npm install
cp .env.example .env     # fill in the values
npm run seed             # demo accounts and sample trips
npm run dev              # http://localhost:5000
```

`npm run seed:clear` removes the demo data again. A Postman collection (`travel-buddy-backend.postman_collection.json`) is included.

### Environment (`.env`, git-ignored)

`PORT`, `MONGODB_URI`, `MONGODB_DB`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `CLIENT_URL` (allowed browser origins), `GOOGLE_CLIENT_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SMTP_*` / `MAIL_FROM` or `RESEND_API_KEY`, `IMGBB_API_KEY`, `CONTACT_EMAIL`.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run typecheck` · `npm run seed` · `npm run seed:clear`

## Deploying

Deploys to Vercel through `api/index.ts`. Set the variables above and point `CLIENT_URL` at the frontend.

---

<div align="center">

Made by **[Rudra Protap Chakraborty](https://rudraprotapchakraborty.com)** · [Portfolio](https://rudraprotapchakraborty.com) · [GitHub](https://github.com/rudraprotapchakraborty)

</div>
