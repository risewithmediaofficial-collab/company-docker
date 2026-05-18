# 🚀 Agency CRM & Project Management System

A production-ready full-stack SaaS operating system for digital marketing agencies, built with the **MERN** stack (JavaScript only).

## ✨ Features

- **CRM Module**: Kanban pipeline, lead tracking, activity logs, and auto-assignment.
- **Project Management**: ClickUp-style board, task management, subtasks, and progress tracking.
- **HR & Team**: Attendance system (clock in/out), EOD reports, and job board.
- **Finance**: Invoice generation, expense tracking, and revenue analytics.
- **Real-time**: Live notifications and task updates via Socket.io.
- **Auth**: Complete JWT system with role-based access (Admin, Manager, Employee, Client, Referral).

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Redux Toolkit, Framer Motion, Recharts, Lucide React.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, Nodemailer.

---

## 🏁 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Compass (Running locally)

### 2. Backend Setup
```bash
cd server
npm install
# Copy .env.example to .env and configure your variables
npm run seed  # This will create test accounts and data
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 🔑 Test Accounts (Seeded)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@agencycrm.com` | `password123` |
| **Manager** | `manager@agencycrm.com` | `password123` |
| **Employee** | `employee@agencycrm.com` | `password123` |
| **Client** | `client@agencycrm.com` | `password123` |
| **Referral** | `referral@agencycrm.com` | `password123` |

---

## 📂 Project Structure

```text
├── client/              # React + Vite Frontend
│   ├── src/
│   │   ├── api/         # Axios config
│   │   ├── components/  # Reusable UI
│   │   ├── layouts/     # Main/Auth Layouts
│   │   ├── pages/       # Dashboard, CRM, Projects, etc.
│   │   └── store/       # Redux State Management
└── server/              # Node.js + Express Backend
    ├── config/          # DB & Socket config
    ├── controllers/     # Business logic
    ├── models/          # Mongoose Schemas
    ├── routes/          # API Endpoints
    └── services/        # Automation Engine
```

## 📜 Development Rules
- **No TypeScript**: Written entirely in pure JavaScript.
- **Responsive**: Fully optimized for mobile and desktop.
- **Premium UI**: Uses custom Tailwind tokens and smooth animations.
