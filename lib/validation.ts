import { z } from "zod";
import { fromInputDateTime } from "@/lib/date";

export const roomSchema = z.object({
  name: z.string().trim().min(1, "Room name is required."),
  location: z.string().trim().optional().default(""),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1."),
  amenities: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  isActive: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((value) => value === true || value === "true"),
});

export const bookingSchema = z
  .object({
    roomId: z.string().uuid("Please choose a room."),
    title: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().optional().default(""),
    start: z.string().min(1, "Start time is required."),
    end: z.string().min(1, "End time is required."),
    attendees: z
      .string()
      .default("")
      .transform((value) =>
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.email("Attendees must be valid emails."))),
  })
  .superRefine((value, context) => {
    const start = fromInputDateTime(value.start);
    const end = fromInputDateTime(value.end);

    if (Number.isNaN(start.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["start"],
        message: "Start time is invalid.",
      });
    }

    if (Number.isNaN(end.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end"],
        message: "End time is invalid.",
      });
    }

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end"],
        message: "End time must be after the start time.",
      });
    }
  });

export const bookingFilterSchema = z.object({
  date: z.string().optional(),
  roomId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.enum(["confirmed", "cancelled"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const availabilitySchema = z.object({
  roomId: z.string().uuid(),
  date: z.string(),
});

export type RoomInput = z.infer<typeof roomSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
