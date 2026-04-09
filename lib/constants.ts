export const roomColorPalette = [
  "#0f766e",
  "#0369a1",
  "#4338ca",
  "#7c3aed",
  "#be123c",
  "#c2410c",
  "#65a30d",
  "#0f172a",
  "#0891b2",
  "#7f1d1d",
] as const;

export function getRoomColor(roomId: string) {
  const hash = roomId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return roomColorPalette[hash % roomColorPalette.length];
}

export const appNavigation: Array<{
  adminOnly?: boolean;
  href: string;
  label: string;
}> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/bookings/new", label: "New Booking" },
  { href: "/bookings/my", label: "My Bookings" },
  { href: "/admin/rooms", label: "Admin Rooms", adminOnly: true },
  { href: "/admin/bookings", label: "Admin Bookings", adminOnly: true },
] as const;
