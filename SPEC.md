# SPEC.md — Meeting Room Booking System (MRBS)

@TASKS.md

> System specification reference. Read before starting any development.

---

## 1. System Overview

Internal web application for staff to book meeting rooms. Replaces manual methods with a centralised platform that prevents double booking and sends automatic notifications.

**Users:** Internal staff only  
**Host:** Local / intranet  
**Database:** SQLite (`data/mrbs.db`)  
**Language:** English (default). Dual-language support planned for a future phase.

---

## 2. User Roles

| Role | Capabilities |
|------|-------------|
| `user` | Login, create bookings, view calendar, manage own bookings |
| `admin` | All user capabilities + manage rooms, view & cancel all bookings, manage users |

---

## 3. Database Schema

### `users`
| Column | Type | Constraint |
|--------|------|------------|
| id | text | PRIMARY KEY (UUID) |
| name | text | NOT NULL |
| email | text | UNIQUE, NOT NULL |
| password | text | NOT NULL (bcrypt) |
| role | text | DEFAULT 'user' |
| department | text | |
| created_at | integer | NOT NULL (Unix timestamp) |

### `rooms`
| Column | Type | Constraint |
|--------|------|------------|
| id | text | PRIMARY KEY (UUID) |
| name | text | NOT NULL |
| location | text | |
| capacity | integer | NOT NULL |
| amenities | text | JSON array e.g. `["projector","wifi"]` |
| is_active | integer | DEFAULT 1 |
| created_at | integer | NOT NULL |

### `bookings`
| Column | Type | Constraint |
|--------|------|------------|
| id | text | PRIMARY KEY (UUID) |
| room_id | text | FK → rooms.id |
| user_id | text | FK → users.id |
| title | text | NOT NULL |
| description | text | |
| start_time | integer | NOT NULL (Unix timestamp) |
| end_time | integer | NOT NULL (Unix timestamp) |
| attendees | text | JSON array of emails |
| status | text | DEFAULT 'confirmed' |
| created_at | integer | NOT NULL |

> `status` values: `'confirmed'` or `'cancelled'`

---

## 4. API Endpoints

### Rooms
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/rooms` | user | List active rooms |
| GET | `/api/rooms/[id]` | user | Room detail |
| POST | `/api/rooms` | admin | Create room |
| PATCH | `/api/rooms/[id]` | admin | Update room |
| DELETE | `/api/rooms/[id]` | admin | Soft delete (`is_active=0`) |

### Bookings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/bookings` | user | List bookings (filter: `?date=`, `?room_id=`, `?user_id=`) |
| GET | `/api/bookings/[id]` | user | Booking detail |
| POST | `/api/bookings` | user | Create booking + conflict check |
| PATCH | `/api/bookings/[id]` | owner/admin | Update booking |
| DELETE | `/api/bookings/[id]` | owner/admin | Cancel (`status='cancelled'`) |
| GET | `/api/bookings/availability` | user | Available slots (`?room_id=&date=`) |

### Conflict Detection
Before saving a new booking, run:
```sql
SELECT * FROM bookings
WHERE room_id = :room_id
  AND status = 'confirmed'
  AND start_time < :new_end_time
  AND end_time > :new_start_time
```
If result exists → return `409 { error: "CONFLICT", conflicting: { ...booking } }`

---

## 5. Pages

| Page | Path | Access |
|------|------|--------|
| Login | `/login` | Public |
| Dashboard | `/dashboard` | User |
| Calendar | `/calendar` | User |
| New Booking | `/bookings/new` | User |
| My Bookings | `/bookings/my` | User |
| Booking Detail | `/bookings/[id]` | Owner / Admin |
| Admin - Rooms | `/admin/rooms` | Admin |
| Admin - Bookings | `/admin/bookings` | Admin |

---

## 6. Auth Rules

- All routes except `/login` and `/api/auth/*` are protected by `middleware.ts`
- `/admin/*` routes restricted to `role === 'admin'`
- API routes check session — return `401` if no session, `403` if insufficient role
- Owner = `session.user.id === booking.user_id`

---

## 7. Email Notifications

| Trigger | Recipients |
|---------|-----------|
| Booking created | Organiser + all attendees |
| Booking cancelled | Organiser + all attendees |
| Booking updated | Organiser + all attendees |

Configured via `.env.local`. If SMTP is not configured, log to `console` only (no crash).

---

## 8. Calendar View

- Library: `react-big-calendar` + `date-fns` localizer
- Views: Month / Week / Day (default: Week)
- Each room has a distinct event colour
- Click event → detail modal
- Click empty slot → navigate to `/bookings/new?room_id=&start=&end=`
- Filter dropdown by room

---

## 9. Seed Data

Run `npm run db:seed` to generate:
- Admin: `admin@company.com` / `admin123`
- Staff: `staff@company.com` / `staff123`
- 5 rooms with varying capacity & amenities
- 3 sample bookings (today & tomorrow)

---

## 10. Environment Variables

```env
DATABASE_URL=./data/mrbs.db
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM="MRBS <noreply@company.com>"
```
