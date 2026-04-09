import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db, sqlite } from "./index";
import { bookings, rooms, users } from "./schema";

function atHour(baseDate: Date, hour: number, minute = 0) {
  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function run() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const createdAt = new Date();
  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

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
      createdAt,
    },
    {
      id: uuidv4(),
      name: "Harbour Room",
      location: "Level 1 - South Wing",
      capacity: 6,
      amenities: ["wifi", "projector", "conference-phone"],
      isActive: true,
      createdAt,
    },
    {
      id: uuidv4(),
      name: "Summit Room",
      location: "Level 2 - East Wing",
      capacity: 8,
      amenities: ["wifi", "projector", "whiteboard", "video-call"],
      isActive: true,
      createdAt,
    },
    {
      id: uuidv4(),
      name: "Riverside Boardroom",
      location: "Level 2 - West Wing",
      capacity: 10,
      amenities: ["wifi", "projector", "video-call", "speakerphone"],
      isActive: true,
      createdAt,
    },
    {
      id: uuidv4(),
      name: "Atrium Hall",
      location: "Ground Floor - Central Atrium",
      capacity: 14,
      amenities: ["wifi", "projector", "microphone", "stage-display"],
      isActive: true,
      createdAt,
    },
  ];

  const seededBookings = [
    {
      id: uuidv4(),
      roomId: seededRooms[0].id,
      userId: staffUserId,
      title: "Client Planning Session",
      description: "Kick-off meeting to align agenda and project milestones.",
      startTime: atHour(today, 9),
      endTime: atHour(today, 10),
      attendees: ["staff@company.com", "ops@company.com"],
      status: "confirmed" as const,
      createdAt,
    },
    {
      id: uuidv4(),
      roomId: seededRooms[2].id,
      userId: adminUserId,
      title: "Leadership Sync",
      description: "Weekly planning session for department heads.",
      startTime: atHour(today, 14),
      endTime: atHour(today, 15, 30),
      attendees: ["admin@company.com", "finance@company.com", "hr@company.com"],
      status: "confirmed" as const,
      createdAt,
    },
    {
      id: uuidv4(),
      roomId: seededRooms[4].id,
      userId: staffUserId,
      title: "Town Hall Rehearsal",
      description: "Dry run for tomorrow's all-hands presentation.",
      startTime: atHour(tomorrow, 11),
      endTime: atHour(tomorrow, 12),
      attendees: ["staff@company.com", "comms@company.com", "it@company.com"],
      status: "confirmed" as const,
      createdAt,
    },
  ];

  sqlite.transaction(() => {
    db.delete(bookings).run();
    db.delete(rooms).run();
    db.delete(users).run();

    db.insert(users)
      .values([
        {
          id: adminUserId,
          name: "System Admin",
          email: "admin@company.com",
          password: adminPassword,
          role: "admin",
          department: "Operations",
          createdAt,
        },
        {
          id: staffUserId,
          name: "Staff User",
          email: "staff@company.com",
          password: staffPassword,
          role: "user",
          department: "General Affairs",
          createdAt,
        },
      ])
      .run();

    db.insert(rooms).values(seededRooms).run();
    db.insert(bookings).values(seededBookings).run();
  })();

  console.log(
    JSON.stringify(
      {
        users: 2,
        rooms: seededRooms.length,
        bookings: seededBookings.length,
      },
      null,
      2,
    ),
  );

  sqlite.close();
}

run().catch((error) => {
  console.error("Database seed failed.");
  console.error(error);
  sqlite.close();
  process.exit(1);
});
