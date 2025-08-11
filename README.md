# E‑Commerce Platform (Full‑Stack Case Study)

Modern e‑commerce application that delivers customer shopping flows, a lightweight admin panel, and simple recommendation features. The codebase is a monorepo with Next.js 14 (App Router) frontend and Node.js/Express + TypeScript backend.

## Project Structure

- `backend/`: Express + TypeScript API with MongoDB/Mongoose, JWT auth, validation, file upload, admin stats
- `frontend/`: Next.js 14 + TypeScript, RTK Query / React Hook Form, Tailwind CSS, Ant Design components

## Tech Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Ant Design, React Hook Form + Zod, RTK/RTK Query
- Backend: Node 18+, Express 5, TypeScript, Mongoose 8, JWT (jsonwebtoken), bcryptjs, Multer, Zod, Nodemailer, express-rate-limit, CORS
- Database: MongoDB

## Local Setup

Prerequisites: Node.js 18+, MongoDB (local or a connection URI), pnpm/npm/yarn (examples use npm).

1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Environment variables

- Copy `backend/env.example` and `frontend/env.example` as `.env` and fill the values.

```bash
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

3. Seed the database (optional but recommended)

```bash
cd backend
npm run seed
```

4. Run in development

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

5. Production build

```bash
cd backend && npm run build && npm start
cd ../frontend && npm run build && npm start
```

## Demo Credentials (created by seed)

- Admin: `admin@example.com` / `admin123`
- Customer: `user@example.com` / `user123`

## API Overview

Base URL: `http://localhost:5000/api`

- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/verify-email`
- Products: `GET /products` (supports filtering/sorting/pagination), `GET /products/:id`, `GET /products/:id/related`
- Products (admin): `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`, `PATCH /products/bulk/status`
- Categories: `GET /categories`, `GET /categories/:id` (+ admin CRUD)
- Orders: `POST /orders`, `GET /orders`, `GET /orders/:id`, `POST /orders/:id/cancel`, `POST /orders/:id/pay`, `PATCH /orders/:id/status` (admin)
- Reviews: `GET /reviews/:productId`, `POST /reviews`
- Admin: `GET /admin/stats`, `GET /admin/users`, `GET /admin/users/:id`
- Uploads: `POST /uploads/*` (image upload; MIME/size validations)

Note: For protected endpoints send `Authorization: Bearer <token>` header.

## Implemented Features

- Customer: category and product listing (filter/sort/paginate), product detail with gallery and reviews, cart/checkout flow
- Auth: register, login, email verification, password reset
- Admin: product/category management, bulk activate/deactivate; admin stats endpoints
- Reviews: 1–5 stars + comment; average rating on products
- Recommendations: related products on product detail; basic activity tracking foundation for popular/recently viewed

## Security & Performance

- JWT-based sessions, bcrypt password hashing, rate limiting (stricter on auth routes)
- Zod-based request validation, XSS/iframe/MIME protections and security headers
- CORS configuration; HTTPS assumed in production
- `next/image` with lazy loading; fully responsive layout

## Environment Variables

Backend `.env` keys:

- `PORT`, `NODE_ENV`, `FRONTEND_URL`, `MONGODB_URI`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`
- `OPENAI_API_KEY` (optional; for text-similarity based recommendations)

Frontend `.env`:

- `NEXT_PUBLIC_API_BASE` (default: `http://localhost:5000`)

## Deployment (Quick)

1. Fill backend `.env` with production values, then `npm run build && npm start`.
2. Point `NEXT_PUBLIC_API_BASE` to the prod API URL and run `npm run build && npm start` for the frontend.
3. Whitelist your production domain in CORS (see `backend/src/index.ts` `origin`).

## Development Standards

- Consistent TypeScript types, meaningful commit messages, clear folder structure, reusable components, and centralized error handling.

## License

For educational/demo purposes.
