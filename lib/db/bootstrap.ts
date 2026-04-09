import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type Database from "better-sqlite3";
import { bookings, rooms, users } from "./schema";

function atHour(baseDate: Date, hour: number, minute = 0) {
  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function ensureSchema(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      email text NOT NULL,
      password text NOT NULL,
      role text DEFAULT 'user' NOT NULL,
      department text,
      created_at integer DEFAULT (unixepoch() * 1000) NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);

    CREATE TABLE IF NOT EXISTS rooms (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      location text,
      capacity integer NOT NULL,
      amenities text DEFAULT '[]' NOT NULL,
      is_active integer DEFAULT true NOT NULL,
      created_at integer DEFAULT (unixepoch() * 1000) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id text PRIMARY KEY NOT NULL,
      room_id text NOT NULL,
      user_id text NOT NULL,
      title text NOT NULL,
      description text,
      start_time integer NOT NULL,
      end_time integer NOT NULL,
      attendees text DEFAULT '[]' NOT NULL,
      status text DEFAULT 'confirmed' NOT NULL,
      created_at integer DEFAULT (unixepoch() * 1000) NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms (id) ON UPDATE no action ON DELETE no action,
      FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE no action ON DELETE no action
    );
  `);
}

export function ensureDatabaseReady(sqlite: Database.Database, database: any) {
  ensureSchema(sqlite);

  const adminEmail = "admin@company.com";
  const adminExists = database
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .get();

  if (adminExists) {
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const createdAt = new Date();
  const adminUserId = uuidv4();
  const staffUserId = uuidv4();
  const seededRooms = [
    {
      id: uuidv4(),
      name: "Rainforest Room",
      location: "Level 1 - North Wing",
      capacity: 4,
      amenities: ["wifi", "display", "whiteboard"],
      isActive: true,
      createdAt: createdAt.getTime(),
    },
    {
      id: uuidv4(),
      name: "Harbour Room",
      location: "Level 1 - South Wing",
      capacity: 6,
      amenities: ["wifi", "projector", "conference-phone"],
      isActive: true,
      createdAt: createdAt.getTime(),
    },
    {
      id: uuidv4(),
      name: "Summit Room",
      location: "Level 2 - East Wing",
      capacity: 8,
      amenities: ["wifi", "projector", "whiteboard", "video-call"],
      isActive: true,
      createdAt: createdAt.getTime(),
    },
    {
      id: uuidv4(),
      name: "Riverside Boardroom",
      location: "Level 2 - West Wing",
      capacity: 10,
      amenities: ["wifi", "projector", "video-call", "speakerphone"],
      isActive: true,
      createdAt: createdAt.getTime(),
    },
    {
      id: uuidv4(),
      name: "Atrium Hall",
      location: "Ground Floor - Central Atrium",
      capacity: 14,
      amenities: ["wifi", "projector", "microphone", "stage-display"],
      isActive: true,
      createdAt: createdAt.getTime(),
    },
  ];

  const seededBookings = [
    {
      id: uuidv4(),
      roomId: seededRooms[0].id,
      userId: staffUserId,
      title: "Client Planning Session",
      description: "Kick-off meeting to align agenda and project milestones.",
      startTime: atHour(today, 9).getTime(),
      endTime: atHour(today, 10).getTime(),
      attendees: JSON.stringify(["staff@company.com", "ops@company.com"]),
      status: "confirmed" as const,
      createdAt: createdAt.getTime(),
    },
    {
      id: uuidv4(),
      roomId: seededRooms[2].id,
      userId: adminUserId,
      title: "Leadership Sync",
      description: "Weekly planning session for department heads.",
      startTime: atHour(today, 14).getTime(),
      endTime: atHour(today, 15, 30).getTime(),
      attendees: JSON.stringify(["admin@company.com", "finance@company.com", "hr@company.com"]),
      status: "confirmed" as const,
      createdAt: createdAt.getTime(),
    },
    {
      id: uuidv4(),
      roomId: seededRooms[4].id,
      userId: staffUserId,
      title: "Town Hall Rehearsal",
      description: "Dry run for tomorrow's all-hands presentation.",
      startTime: atHour(tomorrow, 11).getTime(),
      endTime: atHour(tomorrow, 12).getTime(),
      attendees: JSON.stringify(["staff@company.com", "comms@company.com", "it@company.com"]),
      status: "confirmed" as const,
      createdAt: createdAt.getTime(),
    },
  ];

  sqlite.transaction(() => {
    database
      .insert(users)
      .values([
        {
          id: adminUserId,
          name: "System Admin",
          email: adminEmail,
          password: bcrypt.hashSync("admin123", 10),
          role: "admin",
          department: "Operations",
          createdAt: createdAt.getTime(),
        },
        {
          id: staffUserId,
          name: "Staff User",
          email: "staff@company.com",
          password: bcrypt.hashSync("staff123", 10),
          role: "user",
          department: "General Affairs",
          createdAt: createdAt.getTime(),
        },
      ] as any)
      .run();

    database.insert(rooms).values(seededRooms as any).run();
    database.insert(bookings).values(seededBookings as any).run();
  })();
}
