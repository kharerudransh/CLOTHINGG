# CLOTHINGG

**TIMELESS · REFINED · YOURS**

A full-stack, multi-vendor fashion marketplace built on the MERN stack. Independent sellers publish garments with per-variant pricing and stock; buyers browse, fill a server-side cart, and check out through Razorpay. Buyers and sellers get separate, role-protected dashboards.

**Live demo:** https://clothingg-dun.vercel.app
**API:** https://clothingg.onrender.com

> The API runs on Render's free tier, so the first request after a period of inactivity can take up to a minute while the service wakes up.

<!-- Add screenshots here, e.g. ![Landing page](docs/landing.png) -->

---

## Features

**Authentication and security**
- Email and password registration with email verification (time-limited JWT link)
- Password reset by email (15-minute token)
- Google OAuth 2.0 sign-in (Passport.js)
- JWT stored in `httpOnly` cookies; passwords hashed with bcrypt
- Session rehydration on page load and role-based redirects (Buyer, Seller, guest)
- Request validation with express-validator

**Buyer experience**
- Interactive Three.js landing page
- Product catalogue and detailed product pages with image carousels
- Variant selection (attributes such as size, per-variant price, stock, images)
- Persistent server-side cart: add, increment, decrement, remove
- Profile page

**Seller experience**
- Seller-only workspace with protected routes
- Add products with multi-image upload (Multer to ImageKit CDN)
- Add variants to a product (attributes, price, stock, images; currency defaults to INR)
- Seller product listing with delete confirmation

**Cart and payments**
- Cart totals are computed on the server with a MongoDB aggregation pipeline (`$lookup`, `$unwind`, `$group`) from **live variant prices**, never from client-sent values
- Razorpay order creation using the server-calculated amount

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Redux Toolkit, React Router v7 (`createBrowserRouter`), Tailwind CSS, Three.js, Framer Motion, react-hot-toast |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT (httpOnly cookie), Passport (Google OAuth 2.0), bcrypt |
| Media | Multer, ImageKit |
| Payments | Razorpay |
| Hosting | Vercel (frontend), Render (backend) |

---

## Project structure

```
CLOTHINGG/
├── backend/
│   ├── server.js
│   └── src/
│       ├── app.js            # Express app, CORS, Passport strategy, route mounting
│       ├── config/           # Environment validation (fails fast on missing vars)
│       ├── controller/       # auth, product, cart controllers
│       ├── middleware/       # authenticateUser (JWT cookie)
│       ├── model/            # user, product, cart schemas
│       ├── routes/           # auth, product, cart routers
│       ├── services/         # mail, payment (Razorpay)
│       └── validation/       # express-validator rules
└── frontend/
    └── clothingg/
        ├── vercel.json       # /api proxy + SPA rewrite
        └── src/
            └── features/     # auth, products, Cart, User (api service, hooks, state, pages)
```

---

## Getting started

### Prerequisites
- Node.js 20 or later
- A MongoDB Atlas cluster (or local MongoDB)
- Accounts and keys for Google OAuth, ImageKit, Razorpay (test mode is fine), and an email provider

### 1. Clone

```bash
git clone https://github.com/kharerudransh/CLOTHINGG.git
cd CLOTHINGG
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env` (see [Environment variables](#environment-variables)), then:

```bash
npm run dev      # nodemon server.js, listens on port 3000
```

### 3. Frontend

```bash
cd frontend/clothingg
npm install
npm run dev      # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:3000`, so the frontend uses relative URLs and needs no extra configuration locally.

---

## Environment variables

Backend (`backend/.env`):

| Variable | Purpose |
| --- | --- |
| `PORT` | Port the API listens on |
| `MONGO_URL` | MongoDB connection string |
| `JWT_TOKEN` | Secret used to sign JWTs |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Email account credentials required by `config.js` |
| `GOOGLE_CLIENTID`, `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `ImageKitURLENDPOINTS`, `ImageKit_Public_Key`, `ImageKit_Private_Key` | ImageKit media storage |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay credentials (use test keys while developing) |

Production only:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV=production` | Enables `secure` and `sameSite: none` cookie flags |
| `FRONTEND_URL` | Deployed frontend origin, used for CORS and for links in emails |
| `GOOGLE_CALLBACK_URL` | Absolute Google OAuth callback URL on the deployed domain |

`backend/src/config/config.js` throws at startup if a required variable is missing. Never commit `.env` files.

---

## API overview

All routes are prefixed with `/api`.

**Auth** (`/api/auth`)

| Method | Route | Description |
| --- | --- | --- |
| POST | `/register` | Create account and send verification email |
| GET | `/verify?token=` | Verify email and sign in |
| POST | `/login` | Sign in (sets `jwt` cookie) |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password?token=` | Set a new password |
| GET | `/google`, `/google/callback` | Google OAuth flow |
| GET | `/getMe`, `/profile` | Current user (authenticated) |
| POST | `/logout` | Clear session cookie |

**Products** (`/api/products`): product listing and detail endpoints, plus seller routes for adding products and variants.

**Cart** (`/api/cart`)

| Method | Route | Description |
| --- | --- | --- |
| POST | `/add/:productId/:variantId` | Add an item |
| GET | `/get` | Cart with product details and server-calculated total |
| PATCH | `/quantity/increment/:productId/:variantId` | Increase quantity |
| PATCH | `/quantity/decrement/:productId/:variantId` | Decrease quantity |
| DELETE | `/remove/:productId/:variantId` | Remove an item |
| POST | `/payment/create/order` | Create a Razorpay order from the cart total |

---

## Deployment

**Backend on Render**
- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`
- Add every variable from the tables above, including the production-only ones
- Allow Render to reach MongoDB Atlas under Network Access

**Frontend on Vercel**
- Root directory: `frontend/clothingg` (Vite preset)
- `vercel.json` proxies `/api/*` to the Render backend and rewrites all other routes to `/index.html`
- Because the browser only talks to the Vercel domain, the auth cookie stays first-party and avoids third-party cookie blocking
- Register `https://<your-vercel-domain>/api/auth/google/callback` as an authorized redirect URI in Google Cloud Console

---

## Roadmap

- Server-side Razorpay payment signature verification and persisted order records
- Order history for buyers and sales view for sellers
- Update-address flow on the profile page
- LLM assistant for sellers (pricing and listing guidance)

---

## Author

**Rudransh Khare**: [GitHub](https://github.com/kharerudransh) · [LinkedIn](https://linkedin.com/in/rudransh-khare-55558233a)
