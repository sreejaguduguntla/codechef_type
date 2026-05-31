# 🏆 CodeArena — Online Code Judge

A full-stack MERN Online Code Judge platform inspired by CodeChef, featuring a VS Code-style Monaco editor, real code execution via Judge0, and a global leaderboard.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (running locally at `localhost:27017`)
- (Optional) RapidAPI Judge0 CE key for real code execution

### 1. Install dependencies
```bash
cd online-judge
npm run install:all
```

### 2. Seed the database (10 sample problems + sample users)
```bash
npm run seed
```

### 3. Start both servers
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

---

## 🔑 Demo Accounts

| Role  | Email                    | Password    |
|-------|--------------------------|-------------|
| Admin | admin@codejudge.io       | admin123    |
| User  | alice@example.com        | password123 |
| User  | bob@example.com          | password123 |

---

## ⚡ Code Execution (Judge0)

To enable real code execution:

1. Sign up at [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Get your free API key
3. Update `backend/.env`:
   ```
   JUDGE0_API_KEY=your_actual_key_here
   ```

Without a key, submissions will return an error from Judge0.

---

## 📁 Project Structure

```
online-judge/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # auth, problems, submissions, users
│   ├── middleware/     # JWT auth + admin guard
│   ├── models/         # User, Problem, Submission
│   ├── routes/         # API route definitions
│   ├── utils/          # Judge0 integration
│   ├── server.js       # Express entry point
│   └── seed.js         # Database seeder
└── frontend/
    └── src/
        ├── api/        # Axios instance
        ├── components/ # Navbar, Footer
        ├── context/    # Auth context
        ├── pages/      # Home, Problems, ProblemDetail, Profile, Leaderboard, Admin
        └── styles/     # Global CSS design system
```

---

## 🧩 Features

| Feature | Description |
|---------|-------------|
| Auth | JWT-based register/login/logout |
| Problem Set | Browse, filter by difficulty, search |
| Code Editor | Monaco Editor (VS Code style) |
| Languages | C++, Python, Java, JavaScript, C |
| Submissions | Real-time verdict via Judge0 CE |
| Profile | Solved problems, stats, difficulty breakdown |
| Leaderboard | Ranked by score & problems solved |
| Admin Panel | Create/delete problems, view all submissions |

---

## 🎨 Design

- Dark theme with glassmorphism cards
- Electric blue + green accent palette
- Inter + JetBrains Mono fonts
- Smooth animations and micro-interactions
- Fully responsive
