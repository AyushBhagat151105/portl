# Portl — Smart Gated Community & Society Management Platform

![Portl Platform Banner](https://raw.githubusercontent.com/AyushBhagat151105/portl/master/apps/native/assets/images/icon.png)

> **Portl** is an end-to-end, high-performance smart society management ecosystem built for modern gated communities. It seamlessly connects **Residents**, **Security Guards**, and **Society Administrators** with real-time gate entry approvals, treasury financial transparency, digital visitor passes, maintenance dues, and instant OTA bundle updates.

---

## 🌟 Key Features

### 🚪 1. Smart Security & Gate Management (Guard & Resident)
- **Instant Gate Entry Requests**: Security guards initiate entry requests; residents receive immediate push notifications to approve or deny entry.
- **Digital Guest Passes & QR Scanner**: Pre-approve visitors with auto-generated passcodes and native QR code scanning at the gate.
- **Checkout Logs & Visitor History**: Real-time logging of visitor check-in/checkout timestamps.

### 💰 2. Society Treasury & Dues Management
- **Maintenance Dues**: Generate, view, and pay monthly maintenance dues with Razorpay payment gateway integration.
- **Transparent Society Treasury**: Detailed ledger tracking of society budgets, logged expenses, block collections, and fixed deposit assets.
- **Resident Read-Only View**: Complete financial transparency for residents to inspect society expenditure without write permissions.

### 📣 3. Community Engagement & Helpdesk
- **Notice Board**: Official society announcements with image attachments and categorization.
- **Interactive Voting Polls**: Live community polls with real-time percentage results and admin poll closure options.
- **Helpdesk Ticket System**: Track, assign, and resolve resident maintenance complaints (Plumbing, Electrical, General).

### 📅 4. Amenities Scheduler & Parking Helper
- **Facility Reservations**: Reserve clubhouses, tennis courts, and party halls with slot availability and admin verification.
- **Vehicle & Parking Directory**: Track resident and visitor vehicles with slot allocation.

### 🔄 5. Self-Hosted Over-the-Air (OTA) Updates
- **Instant Bundle Delivery**: In-app runtime update engine that fetches hot fixes directly from the self-hosted production API server without requiring app store re-installation.

---

## 🏗️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Mobile App (Frontend)** | React Native, Expo SDK 56, Expo Router, Tailwind CSS v4 (via Uniwind), HeroUI Native, Lucide/Ionicons |
| **State & Data Fetching** | TanStack Query (React Query v5), Zustand |
| **Backend API (Server)** | Hono Framework, Bun Runtime, TypeScript |
| **Database & Auth** | PostgreSQL, Prisma ORM (v7), Better Auth (RBAC: Admin, Resident, Guard) |
| **API Documentation** | Scalar OpenAPI Interactive Reference (`/reference`) |
| **Media & Storage** | Cloudinary Cloud Storage |
| **Deployment & CI/CD** | Docker, GitHub Actions (Self-hosted APK build & VPS deployment pipeline) |

---

## 📐 Project Structure

```text
portl/
├── apps/
│   ├── native/               # Mobile Application (Expo Router + React Native)
│   ├── server/               # Backend API Server (Hono + Bun + Prisma)
│   └── web/                  # Web Showcase Landing Page
├── packages/
│   ├── auth/                 # Shared Better Auth configuration & session schemas
│   ├── db/                   # Prisma schema, migrations, and database client
│   ├── env/                  # Zod-validated environment variables
│   └── config/               # Shared TypeScript and ESLint configs
└── .github/workflows/        # Automated APK build & VPS deploy workflow
```

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- **Bun** runtime (v1.1+)
- **Node.js** (v20+)
- **PostgreSQL** database

### 2. Installation & Database Setup
```bash
# Install workspace dependencies
bun install

# Set up environment variables
cp apps/server/.env.example apps/server/.env
cp apps/native/.env.example apps/native/.env

# Sync database schema
bun db:push
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend API Server
bun dev:server

# Terminal 2: Expo Mobile App
bun dev:native
```

---

## 🌐 Live API & Documentation
- **Interactive OpenAPI Reference**: [https://portl-api.ayushbhagat.com/reference](https://portl-api.ayushbhagat.com/reference)
- **Direct APK Download**: [https://portl-api.ayushbhagat.com/uploads/portl.apk](https://portl-api.ayushbhagat.com/uploads/portl.apk)

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
