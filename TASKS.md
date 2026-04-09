# TASKS.md — MRBS Development Tasks

> **Instructions for AI:**
> - Read this file FIRST before starting any work
> - Complete tasks in order
> - **MUST test** each task before marking status as `[x]`
> - Update this file after each completed task
> - If blocked, add a note below the relevant task
> - **Do not skip** — complete one task fully before moving to the next

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done & tested |
| `[!]` | Blocked / issue |

---

## PHASE 1 — Setup & Foundation

### 1.1 Dependencies
- [x] Install: `better-sqlite3 drizzle-orm drizzle-kit`
- [x] Install: `next-auth@beta @auth/drizzle-adapter`
- [x] Install: `nodemailer @types/nodemailer`
- [x] Install: `react-big-calendar date-fns`
- [x] Install: `bcryptjs @types/bcryptjs`
- [x] Install: `zod uuid @types/uuid`

**Test:** `npm install` completes without errors. Verify `package.json`.

---

### 1.2 Database Setup
- [x] Create `data/` folder and add to `.gitignore`
- [x] Create `lib/db/schema.ts` — Drizzle schema (users, rooms, bookings)
- [x] Create `lib/db/index.ts` — connection singleton + WAL mode
- [x] Create `lib/db/migrate.ts` — migration runner script
- [x] Run `npm run db:generate` and `npm run db:migrate`

**Test:** `npm run db:studio` — 3 tables exist with correct columns.

---

### 1.3 Seed Data
- [x] Create `lib/db/seed.ts`
  - 1 admin: `admin@company.com` / `admin123`
  - 1 staff: `staff@company.com` / `staff123`
  - 5 rooms with varying capacity & amenities
  - 3 sample bookings (today & tomorrow)
- [x] Add `db:seed` script to `package.json`
- [x] Run seed

**Test:** `npm run db:studio` — data exists in all tables.

---

### 1.4 Authentication
- [x] Create `lib/auth.ts` — NextAuth v5 config with Credentials Provider
- [x] Create `app/api/auth/[...nextauth]/route.ts`
- [x] Create `proxy.ts` — protects all routes except `/login` and `/api/auth/*` (`middleware.ts` is deprecated in Next.js 16)
- [x] Create `app/(auth)/login/page.tsx` — login form
- [x] Create `app/(auth)/login/action.ts` — server action for login
- [x] Extend NextAuth session type to include `id` and `role`

**Test:**
1. Open `http://localhost:3000` → redirects to `/login`
2. Login with `admin@company.com` / `admin123` → redirects to `/dashboard`
3. Login with wrong password → shows error message
4. Logout → redirects to `/login`

---

## PHASE 2 — API Routes & Core Logic

### 2.1 API - Rooms
- [ ] `GET /api/rooms` — list active rooms
- [ ] `POST /api/rooms` — create room (admin only)
- [ ] `GET /api/rooms/[id]` — room detail
- [ ] `PATCH /api/rooms/[id]` — update room (admin only)
- [ ] `DELETE /api/rooms/[id]` — soft delete (admin only)

**Test:**
- GET → returns room array
- POST without admin token → 403
- POST with admin → new room exists in DB

---

### 2.2 API - Bookings (CRUD)
- [ ] `GET /api/bookings` — with query filters `?date=`, `?room_id=`, `?user_id=`
- [ ] `GET /api/bookings/[id]` — booking detail
- [ ] `PATCH /api/bookings/[id]` — update (owner/admin)
- [ ] `DELETE /api/bookings/[id]` — cancel, set `status='cancelled'`

**Test:**
- GET `/api/bookings?date=YYYY-MM-DD` → returns bookings on that date
- DELETE by non-owner → 403

---

### 2.3 API - Bookings (Create + Conflict)
- [ ] `POST /api/bookings` — create new booking
- [ ] Implement conflict detection query (see SPEC.md)
- [ ] Return 409 with conflict data if overlap exists
- [ ] `GET /api/bookings/availability?room_id=&date=` — available slots

**Test:**
1. Book 9am–10am in Room A → 201
2. Book 9:30am–10:30am in Room A → 409 with conflict info
3. Book 9:30am–10:30am in Room B → 201 (different room is fine)

---

### 2.4 Dashboard Page
- [ ] `app/(dashboard)/dashboard/page.tsx`
  - Today's bookings (current user)
  - "New Booking" button
  - Summary count: total bookings this week
- [ ] Layout for `(dashboard)` route group with navbar

**Test:** Login → dashboard shows correct data from DB.

---

### 2.5 New Booking Form
- [ ] `app/(dashboard)/bookings/new/page.tsx`
  - Room dropdown
  - Date + time picker (start & end)
  - Title & description input
  - Attendees input (email, multiple)
- [ ] Validate with Zod before submit
- [ ] Show error on conflict (from API 409)
- [ ] Redirect to `/bookings/my` on success

**Test:**
1. Submit empty form → shows validation errors
2. Submit with conflicting slot → shows conflict message
3. Submit valid data → booking created, redirect happens

---

### 2.6 My Bookings Page
- [ ] `app/(dashboard)/bookings/my/page.tsx`
  - List current user's bookings
  - Status badge (confirmed/cancelled)
  - Cancel button for upcoming bookings
  - Sort: newest first
- [ ] `app/(dashboard)/bookings/[id]/page.tsx` — full detail page

**Test:** Booking created in 2.5 appears here. Cancel works.

---

## PHASE 3 — Calendar & Email

### 3.1 Calendar View
- [ ] `app/(dashboard)/calendar/page.tsx`
- [ ] Setup `react-big-calendar` with `date-fns` localizer
- [ ] Fetch data from `GET /api/bookings?date=` based on active view
- [ ] Distinct colour per room (10-colour palette)
- [ ] Click event → modal with booking detail
- [ ] Click empty slot → navigate to `/bookings/new?room_id=&start=&end=`
- [ ] Filter dropdown by room

**Test:**
1. Seed data bookings visible in calendar
2. Click empty slot → form pre-filled with selected time
3. Room filter works

---

### 3.2 Email Notifications
- [ ] `lib/email/sender.ts` — Nodemailer transporter setup
- [ ] `lib/email/templates.ts` — 3 HTML templates (created, cancelled, updated)
- [ ] Integrate email in `POST /api/bookings` (on create)
- [ ] Integrate email in `DELETE /api/bookings/[id]` (on cancel)
- [ ] Integrate email in `PATCH /api/bookings/[id]` (on update)
- [ ] Fallback: log to console if SMTP is not configured

**Test:**
1. Create booking → email sent to organiser + attendees
2. No SMTP config in `.env.local` → console.log only, no crash

---

## PHASE 4 — Admin Panel & Finishing

### 4.1 Admin - Manage Rooms
- [ ] `app/(dashboard)/admin/rooms/page.tsx`
  - Table of all rooms
  - Add room button (modal/form)
  - Edit & deactivate buttons
- [ ] Add/edit room form with Zod validation

**Test:** Add new room → appears in list. Deactivate → hidden from regular users.

---

### 4.2 Admin - Manage Bookings
- [ ] `app/(dashboard)/admin/bookings/page.tsx`
  - All bookings (all users)
  - Filter: date, room, status
  - Cancel booking button
- [ ] Guard: redirect if not admin

**Test:** Login as staff → redirected. Login as admin → all bookings visible.

---

### 4.3 Finishing
- [ ] Loading states for all fetches (skeleton / spinner)
- [ ] Empty states (no bookings, no rooms)
- [ ] Error boundary for main pages
- [ ] `README.md` — setup & run instructions
- [ ] Check all TypeScript errors: `npm run build` succeeds with no errors

**Test:** `npm run build` → success. Full flow test: login → create booking → receive email → cancel.

---

## Overall Progress

```
Phase 1: [x][x][x][x]  4/4
Phase 2: [ ][ ][ ][ ][ ][ ]  0/6
Phase 3: [ ][ ]  0/2
Phase 4: [ ][ ][ ]  0/3
```

**Last updated:** 2026-04-09
