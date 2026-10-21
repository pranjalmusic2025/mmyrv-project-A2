# 🎓 Production-Ready Student Attendance Verification System

A secure, mobile-first, real-time student attendance management web application built with **React, TypeScript, Vite, and Supabase PostgreSQL**.

---

## 🌟 Highlights & Architecture

- 🔐 **Zero-Trust Role-Based Access Control**: Student, Faculty/Teacher, and Institutional Administrator tiers enforced via Supabase Auth and PostgreSQL Row Level Security (RLS).
- 🔄 **Dynamic Rotating QR Codes**: Local client canvas generation (zero paid QR API fees) with unpredictable 32-byte cryptographic tokens rotating every 30 seconds.
- ⚡ **Atomic Server-Side Verification**: Runs inside PostgreSQL transactions with `SECURITY DEFINER` and atomic constraints, preventing race conditions, replays, and duplicate check-ins.
- ⏱️ **Flexible Session Management**: Teachers create 5 or 10-minute sessions with real-time countdown progress and live student check-in counters.
- 📍 **Optional Geofence Presence Checks**: Native HTML5 Geolocation API with configurable campus coordinates, radius, accuracy filter, and teacher review queue for uncertain readings.
- 🔑 **Optional Visual Classroom OTP**: Teachers can toggle a 4-digit numeric code on screen to guarantee in-room physical presence without invasive tracking.
- ✏️ **Audited Manual Corrections**: Faculty can manually adjust statuses with mandatory reason logging stored in an immutable audit ledger.
- 📥 **One-Click CSV Export**: Download complete session attendance sheets with student names, roll numbers, timestamps, and verification methods.
- 🧪 **Fully Automated Test Suite**: 65 unit, integration, and security tests covering all role boundaries, token rotation, geofencing, and concurrency constraints.

---

## 🏗️ Project Architecture

```
QA/
├── src/
│   ├── components/
│   │   ├── auth/ProtectedRoute.tsx       # Route protection & role guards
│   │   ├── teacher/QRDisplay.tsx         # Dynamic rotating QR with canvas & timer
│   │   └── student/QRScanner.tsx         # HTML5 camera scanner with GPS & OTP support
│   ├── contexts/
│   │   └── AuthContext.tsx               # Supabase Auth lifecycle & session listener
│   ├── lib/
│   │   ├── supabaseClient.ts             # Resilient Supabase client with safe test fallbacks
│   │   └── attendanceVerification.ts     # Verification RPC client & Haversine distance calculator
│   ├── pages/
│   │   ├── LoginPage.tsx                 # Responsive login with setup banner
│   │   ├── RegisterPage.tsx              # Student registration with validation
│   │   ├── StudentDashboard.tsx          # QR check-in, real-time history, & 75% alerts
│   │   ├── TeacherDashboard.tsx          # Live attendance console, manual overrides, & review queue
│   │   └── AdminDashboard.tsx            # User directory, courses, faculty assignments, & geofence settings
│   ├── styles/
│   │   └── globals.css                   # Tailwind base & custom design system tokens
│   ├── types/
│   │   └── index.ts                      # Central TypeScript interfaces & status unions
│   ├── App.tsx                           # Application routing & toast provider
│   └── main.tsx                          # React entry point
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema.sql                # Core 10 relational tables, indexes, & triggers
│   │   ├── 002_rls_policies.sql          # Row Level Security policies for all tables
│   │   ├── 003_functions.sql             # Stored procedures: generate_qr_token & verify_attendance
│   │   └── 004_seed_demo_data.sql        # Demo courses, campus settings, & elevation helpers
│   └── functions/
│       ├── generate-qr-token/            # Optional Deno Edge Function
│       └── verify-attendance/            # Optional Deno Edge Function
├── tests/
│   ├── attendance.test.ts                # Token parsing, session lifecycle, & status codes
│   ├── security.test.ts                  # Role access control & student isolation
│   ├── integration.test.ts               # Enrollment, geofence, OTP, & audit checks
│   └── setup.ts                          # Vitest environment setup
├── .env.example                          # Environment variable template
├── .gitignore                            # Secure exclusions for secrets & builds
├── vercel.json                           # SPA rewrites & security headers (CSP)
├── vite.config.ts                        # Chunk splitting & path aliases
└── package.json                          # Dependencies & build scripts
```

---

## 🚀 Beginner-Friendly Setup Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env.local

# On Linux/macOS:
cp .env.example .env.local
```
Open `.env.local` and enter your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 3: Run Database Migrations in Supabase
1. Navigate to your **Supabase Dashboard** (free at [supabase.com](https://supabase.com)).
2. Select your project and open the **SQL Editor** from the left navigation bar.
3. Open and run the migrations in order:
   - `supabase/migrations/001_schema.sql` (Creates all tables, constraints, and triggers)
   - `supabase/migrations/002_rls_policies.sql` (Applies Row Level Security)
   - `supabase/migrations/003_functions.sql` (Installs atomic `verify_attendance` & `generate_qr_token` RPCs)
   - `supabase/migrations/004_seed_demo_data.sql` (Optional: Seeds sample classes CS-3A, CS-5B, IT-4A)

> [!NOTE]
> Because migration `003_functions.sql` contains PostgreSQL stored procedures (`SECURITY DEFINER`), you **do not need** to install Docker, the Supabase CLI, or configure Deno to deploy edge functions! Everything works straight out of the box through Supabase's built-in PostgreSQL database.

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Creating Initial User Accounts

1. **Create Student Account**:
   - Go to `/register` in your browser.
   - Enter your name, student ID, email, and password.
   - All self-registrations default strictly to the `student` role.

2. **Elevate to Admin**:
   - Register normally with your administrator email.
   - Run this one-line query in the Supabase SQL Editor:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@college.edu';
     ```

3. **Elevate to Teacher / Faculty**:
   - Register normally with the teacher's email.
   - Run in the Supabase SQL Editor:
     ```sql
     UPDATE public.profiles SET role = 'teacher' WHERE email = 'teacher@college.edu';
     ```
   - Then in the **Admin Dashboard** (`/admin`), assign the teacher to their courses under the **Enrollments & Faculty** tab.

---

## 🧪 Automated Testing

Execute the complete test suite:
```bash
npm test
```
All 65 tests verify:
- Role permissions (students blocked from faculty actions, faculty restricted to assigned classes).
- Cryptographic token generation and SHA-256 hash validation.
- Session expiry calculations (5m and 10m windows).
- Geofence distance calculations and GPS accuracy filters.
- Duplicate prevention via atomic constraints.
- Classroom OTP verification logic.
- Mandatory audit trail logging on manual corrections.

To build the production bundle:
```bash
npm run build
```

---

## 🔒 Security & Verification Explanations

### 1. Physical Presence Limitations
- **QR Codes**: Rotating QR codes prevent students from messaging a static photo to an absent classmate across campus. However, a student sitting in the room could still theoretically record a 5-second video clip and stream it.
- **Optional Geofence (GPS)**: Validates that the device is physically within the campus boundary at the moment of scanning. Browsers prompt the student for permission. Location data is never continuously tracked.
- **Classroom OTP**: A visual 4-digit code displayed next to the teacher's projector ensures that only students who can physically see the screen in real time can complete check-in.
- **Campus Wi-Fi**: Note that verifying specific Wi-Fi BSSIDs is not directly accessible to browser JavaScript for privacy reasons and requires an enterprise 802.1X RADIUS integration via campus IT.

### 2. Database Constraints & Row Level Security
- `UNIQUE(session_id, student_id)` on `attendance_records` guarantees at the database engine level that no race condition or double-scan can create duplicate records.
- Stored functions execute with `SECURITY DEFINER`, allowing students to safely record verified attendance without granting frontend access to raw table inserts.

---

## 🌐 Production Deployment (Vercel)

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) → **New Project** → Import repository.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy! The included `vercel.json` automatically configures SPA routing and security headers (CSP, X-Frame-Options, Referrer-Policy).

---

## 💰 Free-Tier Quotas & Maintenance

| Component | Provider | Free Tier Allowance | Ongoing Maintenance |
|---|---|---|---|
| Database & RLS | Supabase | 500 MB PostgreSQL | Vacuum & purge older audit logs annually |
| Authentication | Supabase Auth | 50,000 monthly active users | Manage user status in `/admin` |
| Web Hosting | Vercel | 100 GB monthly bandwidth | Automated via Git push |
| QR Generation | Local JS | Unlimited (0 API calls) | None required |
| QR Scanning | HTML5 Camera API | Unlimited (Client browser) | HTTPS required for camera permissions |

---

## 🛠️ Beginner Troubleshooting

1. **Camera will not open**:
   - Browsers only permit camera access on `localhost` or via **HTTPS**. If testing on another mobile device on your local Wi-Fi, run Vite with an HTTPS tunnel or deploy to Vercel.
2. **"Not enrolled in this class" error**:
   - Log into `/admin` as an Administrator, open the **Enrollments & Faculty** tab, and enroll the student into the course.
3. **"Session is no longer open"**:
   - Attendance sessions expire after the selected duration (5 or 10 minutes). Have the teacher start a new session.
4. **"Missing Supabase credentials"**:
   - Verify that your `.env.local` file contains valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values and restart `npm run dev`.

## GitHub Pages

GitHub Pages serves the committed static UI snapshot from the repository root using the existing `main` branch configuration. The application source (`src/`) is not present in this repository, so this bundle cannot be rebuilt here. A working attendance backend also requires valid Supabase credentials and database setup.
