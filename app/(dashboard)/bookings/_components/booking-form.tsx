"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Room } from "@/lib/db/schema";

type BookingFormProps = {
  rooms: Room[];
  initialValues?: {
    attendees?: string;
    description?: string;
    end?: string;
    roomId?: string;
    start?: string;
    title?: string;
  };
};

type ApiError = {
  error?: string;
  issues?: {
    fieldErrors?: Record<string, string[] | undefined>;
  };
  conflicting?: {
    room?: {
      name: string;
    };
    startTime?: string;
    endTime?: string;
    title?: string;
  };
};

export function BookingForm({ initialValues, rooms }: BookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [values, setValues] = useState({
    attendees: initialValues?.attendees ?? "",
    description: initialValues?.description ?? "",
    end: initialValues?.end ?? "",
    roomId: initialValues?.roomId ?? rooms[0]?.id ?? "",
    start: initialValues?.start ?? "",
    title: initialValues?.title ?? "",
  });

  function updateValue(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      startTransition(() => {
        router.push("/bookings/my?success=Booking+created");
        router.refresh();
      });
      return;
    }

    const payload = (await response.json()) as ApiError;

    if (response.status === 409 && payload.conflicting) {
      setErrorMessage(
        `That slot conflicts with "${payload.conflicting.title}" in ${payload.conflicting.room?.name ?? "the selected room"}.`,
      );
      return;
    }

    if (response.status === 400 && payload.issues?.fieldErrors) {
      setFieldErrors(payload.issues.fieldErrors);
      setErrorMessage("Please fix the highlighted fields.");
      return;
    }

    setErrorMessage("We couldn't save the booking. Please try again.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card grid gap-5 rounded-[2rem] p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Room" error={fieldErrors.roomId?.[0]}>
          <select
            name="roomId"
            value={values.roomId}
            onChange={(event) => updateValue("roomId", event.target.value)}
            className="field-track w-full rounded-full px-4 py-3"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} · {room.capacity} seats
              </option>
            ))}
          </select>
        </Field>

        <Field label="Title" error={fieldErrors.title?.[0]}>
          <input
            name="title"
            value={values.title}
            onChange={(event) => updateValue("title", event.target.value)}
            className="field-track w-full rounded-full px-4 py-3"
            placeholder="Quarterly planning"
          />
        </Field>

        <Field label="Start" error={fieldErrors.start?.[0]}>
          <input
            type="datetime-local"
            name="start"
            value={values.start}
            onChange={(event) => updateValue("start", event.target.value)}
            className="field-track w-full rounded-full px-4 py-3"
          />
        </Field>

        <Field label="End" error={fieldErrors.end?.[0]}>
          <input
            type="datetime-local"
            name="end"
            value={values.end}
            onChange={(event) => updateValue("end", event.target.value)}
            className="field-track w-full rounded-full px-4 py-3"
          />
        </Field>
      </div>

      <Field label="Description" error={fieldErrors.description?.[0]}>
        <textarea
          name="description"
          value={values.description}
          onChange={(event) => updateValue("description", event.target.value)}
          rows={4}
          className="field-track w-full rounded-[1.5rem] px-4 py-3"
          placeholder="Agenda, goals, or dial-in notes"
        />
      </Field>

      <Field label="Attendees" error={fieldErrors.attendees?.[0]}>
        <input
          name="attendees"
          value={values.attendees}
          onChange={(event) => updateValue("attendees", event.target.value)}
          className="field-track w-full rounded-full px-4 py-3"
          placeholder="alex@company.com, jamie@company.com"
        />
      </Field>

      {errorMessage ? (
        <div className="status-danger rounded-[1.5rem] px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="cta-primary inline-flex w-fit rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Create booking"}
      </button>
    </form>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)]">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-[var(--danger-fg)]">{error}</span> : null}
    </label>
  );
}
