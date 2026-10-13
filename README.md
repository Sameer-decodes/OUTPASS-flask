# College Leave & Out-Pass Management System

A beginner-friendly, minimalistic, and fully functional web application designed for colleges and universities to manage student leave and out-pass requests with **automatic approval routing**.

---

## 🌟 Key Features

1. **Role-Based Authentication**:
   - Secure PBKDF2/SHA-256 password hashing and JWT token authorization.
   - Separate dashboards and permissions for **Students**, **Teachers**, and **Wardens**.
   - Students can only submit and view their own requests.
   - Teachers and Wardens can only review requests assigned to their respective roles.

2. **Student Dashboard & Smart Form**:
   - Auto-filled student profile (Name and Roll Number).
   - Selection between **College Leave** and **Out-Pass (Day Visit)**.
   - Destination requirement (mandatory for out-pass, optional for leave).
   - **Real-time Live Routing Indicator**: Automatically displays which authority (Teacher or Warden) will review the request before submission.
   - Live status tracking with clear status badges and rejection reasons when applicable.

3. **Intelligent Automatic Approval Routing**:
   - **Case A (Teacher Approval)**:
     - Applied when the request is **strictly within college working days and hours** (Monday to Friday, 09:00 AM – 05:00 PM).
     - Student &rarr; Teacher &rarr; Final Decision (`Approved by Teacher` or `Rejected`).
   - **Case B (Warden Approval)**:
     - Applied when the request involves **college holidays**, **weekly off-days (weekends)**, **overnight stays**, or **timings outside normal hours**.
     - Student &rarr; Warden &rarr; Final Decision (`Approved by Warden` or `Rejected`).
   - **Configurable Settings**: College working days, hours, and holidays are cleanly configured in `backend/config.py`.
   - **Single Approval Rule**: Only one approver is needed per request; rejected requests stop immediately.

4. **Approver Dashboards (Teacher & Warden)**:
   - Clean summary metrics (Pending, Approved, Rejected, Total).
   - Filter tabs and real-time search.
   - One-click **Approve** or **Reject** with optional rejection reason prompt.

---

## 🛠️ Technology Stack

- **Frontend**: React.js with Tailwind CSS & Lucide Icons (built using Vite)
- **Backend**: Python Flask, Flask-SQLAlchemy, Flask-CORS, PyJWT
- **Database**: PostgreSQL (database: `college_outpass_db`)

---

## 🔑 Demo Accounts (Development & Testing)

Use these pre-seeded accounts to test all roles:

| Role | Email | Password | Name / Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.com` | `Student@123` | Alex Morgan (Roll: `CS-2026-042`) |
| **Teacher** | `teacher@college.com` | `Teacher@123` | Prof. Robert Smith (Case A Approver) |
| **Warden** | `warden@college.com` | `Warden@123` | Dr. Evelyn Reed (Case B Approver) |

> 💡 **Quick Login Tip**: The login page includes **One-Click Demo Login** buttons for instant testing without typing credentials!

---

## 🗄️ PostgreSQL Database Schema

The database `college_outpass_db` contains two tables:

### 1. `users`
- `id`: Integer, Primary Key (Auto-increment)
- `name`: VARCHAR(120), Not Null
- `email`: VARCHAR(150), Unique, Not Null
- `password_hash`: VARCHAR(255), Not Null
- `role`: VARCHAR(20), Not Null (`student`, `teacher`, or `warden`)
- `roll_number`: VARCHAR(50), Nullable (set for students)
- `created_at`: TIMESTAMP WITH TIME ZONE

### 2. `leave_requests`
- `id`: Integer, Primary Key (Auto-increment)
- `student_id`: Integer, Foreign Key &rarr; `users(id)` ON DELETE CASCADE
- `leave_type`: VARCHAR(20), Not Null (`leave` or `outpass`)
- `reason`: TEXT, Not Null
- `from_datetime`: TIMESTAMP, Not Null
- `to_datetime`: TIMESTAMP, Not Null
- `destination`: VARCHAR(255), Nullable (Required for outpass)
- `assigned_approver_role`: VARCHAR(20), Not Null (`teacher` or `warden`)
- `final_status`: VARCHAR(50), Not Null (`Pending Teacher Approval`, `Pending Warden Approval`, `Approved by Teacher`, `Approved by Warden`, `Rejected`)
- `rejection_reason`: TEXT, Nullable
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

---

## 🚀 Getting Started & Setup Guide

### 1. Prerequisites
- Python 3.10+ (with pip)
- Node.js 18+ (with npm)
- PostgreSQL 14+ installed and running on port `5432`

---

### 2. Backend Setup (Flask)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and configure your environment file:
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - Update `DB_PASSWORD` in `.env` with your local PostgreSQL password:
     ```env
     PORT=5000
     SECRET_KEY=college_secret_key_2026
     JWT_SECRET_KEY=college_jwt_key_2026
     DB_HOST=127.0.0.1
     DB_PORT=5432
     DB_USER=postgres
     DB_PASSWORD=your_postgres_password
     DB_NAME=college_outpass_db
     DATABASE_URL=postgresql://postgres:your_postgres_password@127.0.0.1:5432/college_outpass_db
     ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize database tables and seed demo accounts:
   ```bash
   python init_db.py
   python seed.py
   ```

5. Run the automated backend verification test suite:
   ```bash
   python test_backend.py
   ```

6. Start the Flask backend server:
   ```bash
   python app.py
   ```
   *The backend will run at `http://127.0.0.1:5000`.*

---

### 3. Frontend Setup (React & Tailwind)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://127.0.0.1:5173`.*

---

## 🧪 Testing the Approval Routing Workflows

### Scenario 1: Case A (Normal Working Hours &rarr; Teacher Approval)
1. Log in as **Student** (`student@college.com` / `Student@123`).
2. Create an **Out-Pass** request:
   - From: Tomorrow at `10:00 AM`
   - To: Tomorrow at `02:00 PM` (Same working day, within 9 AM – 5 PM)
   - Destination: `Central Library`
   - Reason: `Research for final year project`
3. Notice the live routing box dynamically flags **Case A: Teacher Approval**.
4. Submit the request &rarr; Status becomes **Pending Teacher Approval**.
5. Log out and log in as **Teacher** (`teacher@college.com` / `Teacher@123`).
6. Locate the request in the Teacher queue, click **Approve**, and confirm.
7. Status immediately updates to **Approved by Teacher**.

### Scenario 2: Case B (Holidays / Weekend / Off-Hours &rarr; Warden Approval)
1. Log in as **Student** (`student@college.com` / `Student@123`).
2. Create a **Leave** request:
   - From: This Saturday at `09:00 AM`
   - To: Sunday at `08:00 PM` (Weekly off-days / overnight)
   - Reason: `Visiting family for festival`
3. Notice the live routing box dynamically flags **Case B: Warden Approval**.
4. Submit the request &rarr; Status becomes **Pending Warden Approval**.
5. Log out and log in as **Warden** (`warden@college.com` / `Warden@123`).
6. Locate the request in the Warden queue, click **Reject**, input an optional note (e.g. `Requires written guardian consent`), and confirm.
7. Status immediately updates to **Rejected** with the reason visible on the Student Dashboard.

---

## 📁 Directory Structure

```
outpass-flask/
├── backend/
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Local active configuration
│   ├── requirements.txt      # Python dependencies
│   ├── app.py                # Flask application & blueprint registration
│   ├── config.py             # Configurable college schedule & database URI
│   ├── models.py             # SQLAlchemy models (User, LeaveRequest)
│   ├── routing.py            # Automatic approval routing logic
│   ├── auth_utils.py         # JWT tokens & role permission decorators
│   ├── init_db.py            # PostgreSQL schema creation script
│   ├── seed.py               # Demo accounts & sample data seeder
│   ├── test_backend.py       # Full automated test suite
│   └── routes/
│       ├── auth.py           # Login, logout, current user endpoints
│       └── requests.py       # Request submission, list, approve/reject
├── frontend/
│   ├── index.html            # HTML entry point with metadata
│   ├── package.json          # Node dependencies and scripts
│   ├── vite.config.js        # Vite bundler & API proxy configuration
│   ├── tailwind.config.js    # Tailwind styling tokens
│   ├── postcss.config.js     # PostCSS setup
│   └── src/
│       ├── main.jsx          # React DOM entry point
│       ├── App.jsx           # Application coordinator & routing
│       ├── index.css         # Tailwind directives & typography
│       ├── api.js            # Fetch API client wrapper
│       └── components/
│           ├── Navbar.jsx            # University navigation bar & profile
│           ├── StatusBadge.jsx       # Color-coded status badges
│           ├── PolicyModal.jsx       # College schedule & policy viewer
│           ├── DecisionModal.jsx     # Approve/Reject modal with reason input
│           ├── StudentDashboard.jsx  # Student submission & tracking UI
│           ├── TeacherDashboard.jsx  # Teacher queue & approval UI
│           ├── WardenDashboard.jsx   # Warden queue & approval UI
│           └── Login.jsx             # Clean login with quick demo buttons
└── README.md
```

---

## 📜 License
This project is prepared as an academic submission for college leave and out-pass automation.
