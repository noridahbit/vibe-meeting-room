"use client";

import { useState } from "react";
import type { Room } from "@/lib/db/schema";

type RoomManagerProps = {
  rooms: Room[];
};

export function RoomManager({ rooms: initialRooms }: RoomManagerProps) {
  const [rooms, setRooms] = useState(initialRooms);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [values, setValues] = useState({
    amenities: "",
    capacity: "4",
    isActive: "true",
    location: "",
    name: "",
  });

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setValues({
      amenities: "",
      capacity: "4",
      isActive: "true",
      location: "",
      name: "",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const target = editingId ? `/api/rooms/${editingId}` : "/api/rooms";
    const response = await fetch(target, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...values,
        capacity: Number(values.capacity),
        isActive: values.isActive === "true",
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage("We couldn't save the room.");
      return;
    }

    setMessage(editingId ? "Room updated." : "Room created.");

    if (editingId) {
      setRooms((current) =>
        current.map((room) => (room.id === editingId ? payload : room)),
      );
    } else {
      setRooms((current) => [...current, payload].sort((a, b) => a.name.localeCompare(b.name)));
    }

    resetForm();
  }

  async function handleDeactivate(roomId: string) {
    const response = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });

    if (!response.ok) {
      setMessage("We couldn't deactivate the room.");
      return;
    }

    setRooms((current) =>
      current.map((room) =>
        room.id === roomId ? { ...room, isActive: false } : room,
      ),
    );
    setMessage("Room deactivated.");
  }

  function beginEdit(room: Room) {
    setEditingId(room.id);
    setShowForm(true);
    setValues({
      amenities: room.amenities.join(", "),
      capacity: String(room.capacity),
      isActive: room.isActive ? "true" : "false",
      location: room.location ?? "",
      name: room.name,
    });
  }

  return (
    <div className="grid gap-6">
      <div className="surface-card flex items-center justify-between gap-4 rounded-[2rem] p-6">
        <div>
          <h3 className="font-display text-2xl font-semibold text-white">
            Manage rooms
          </h3>
          <p className="mt-2 text-sm text-[var(--foreground-soft)]">
            Add, edit, or deactivate meeting spaces.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="cta-primary rounded-full px-5 py-3 text-sm font-semibold"
        >
          Add room
        </button>
      </div>

      {message ? (
        <div className="status-success rounded-[1.5rem] px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="surface-card-soft grid gap-4 rounded-[2rem] p-6 md:grid-cols-2"
        >
          <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)]">
            <span>Name</span>
            <input
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              className="field-track rounded-full px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)]">
            <span>Location</span>
            <input
              value={values.location}
              onChange={(event) => setValues((current) => ({ ...current, location: event.target.value }))}
              className="field-track rounded-full px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)]">
            <span>Capacity</span>
            <input
              type="number"
              min="1"
              value={values.capacity}
              onChange={(event) => setValues((current) => ({ ...current, capacity: event.target.value }))}
              className="field-track rounded-full px-4 py-3"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)]">
            <span>Status</span>
            <select
              value={values.isActive}
              onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.value }))}
              className="field-track rounded-full px-4 py-3"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-[var(--foreground-soft)] md:col-span-2">
            <span>Amenities</span>
            <input
              value={values.amenities}
              onChange={(event) => setValues((current) => ({ ...current, amenities: event.target.value }))}
              className="field-track rounded-full px-4 py-3"
              placeholder="wifi, projector, whiteboard"
            />
          </label>
          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              className="cta-primary rounded-full px-5 py-3 text-sm font-semibold"
            >
              {editingId ? "Save changes" : "Create room"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="cta-secondary rounded-full px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-[2rem] surface-card-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="surface-high text-[var(--foreground-soft)]">
            <tr>
              <th className="px-6 py-4 font-medium">Room</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Capacity</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-t border-white/8">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{room.name}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {room.amenities.join(", ")}
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--foreground-soft)]">{room.location ?? "-"}</td>
                <td className="px-6 py-4 text-[var(--foreground-soft)]">{room.capacity}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                      room.isActive
                        ? "status-success"
                        : "surface-high text-[var(--foreground-soft)]"
                    }`}
                  >
                    {room.isActive ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(room)}
                      className="cta-secondary rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    {room.isActive ? (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(room.id)}
                        className="rounded-full bg-[rgba(252,91,91,0.16)] px-3 py-1 text-xs font-semibold text-[var(--danger-fg)] hover:bg-[rgba(252,91,91,0.24)]"
                      >
                        Deactivate
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
