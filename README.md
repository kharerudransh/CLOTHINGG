# 👗 Clothingg — Multi-Vendor Fashion E-Commerce Platform

A full-stack, role-based clothing marketplace built with the **MERN stack**. Sellers list and manage products with variants (size, color, price, stock). Buyers browse, search, and view products in an animated storefront.

> 🚧 **Status:** In active development. Deployment, payment gateway, and an AI shopping assistant are planned (see [Roadmap](#-roadmap)).

---

## ✨ Features

### 🔐 Authentication & Security
- Email/password registration with **email verification link**
- **Google OAuth 2.0** one-click login (Passport.js)
- Forgot / reset password via tokenized email links
- **JWT in HttpOnly cookies** and **bcrypt** password hashing
- Request validation using **Zod** schemas
- Role-based **protected routes** (Buyer / Seller)
- Auto-redirect after login based on user role

### 🛍️ Seller
- Dashboard, inventory manager, and profile
- Create, list, manage, and delete products
- **Variant system:** size, color, per-variant price, per-variant stock, multiple images
- Image upload via **Multer + ImageKit** (CDN hosted)

### 🧑‍💻 Buyer
- Animated fashion storefront
- Browse, search, and filter products
- Product page with image gallery, variant selection, price, and stock status
- Profile and delivery address management

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, React Router v7, Redux Toolkit, Tailwind CSS v4, Framer Motion, Axios, React Hot Toast, Lucide Icons |
| **Backend** | Node.js, Express.js v5, MongoDB, Mongoose |
| **Auth** | JWT, Passport.js (Google OAuth 2.0), bcrypt |
| **Services** | Nodemailer, Multer, ImageKit |
| **Validation** | Zod |

---

## 🗺️ App Routes

| Type | Routes |
|------|--------|
| **Public** | `/login`, `/register`, `/verify-email`, `/verify`, `/forgot-password`, `/reset-password`, `/product/:productId` |
| **Seller** | `/seller-home`, `/add-product`, `/see-products`, `/seller-profile`, `/seller-product/:productId` |
| **Buyer** | `/buyer-home`, `/buyer-products`, `/buyer-profile` |

---

## 📁 Project Structure

```
CLOTHINGG/
├── backend/               # Express API, models, routes, controllers
└── frontend/
    └── clothingg/         # React (Vite) app
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- ImageKit account, Google OAuth credentials, and an email account for Nodemailer

### 1. Clone the repo
```bash
git clone https://github.com/kharerudransh/CLOTHINGG.git
cd CLOTHINGG
```

### 2. Backend setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` (see `.env.example`):
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password

IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint
```
Start the server:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend/clothingg
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

---

## 🧭 Roadmap

- [ ] Payment gateway integration
- [ ] AI shopping assistant chatbot
- [ ] Cart and orders
- [ ] Deployment (Vercel + Render + MongoDB Atlas)

---



**Rudransh Khare**
- LinkedIn: [rudransh-khare](https://www.linkedin.com/in/rudransh-khare-55558233a)
