import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export function formatDateTime(value: Date | number | string) {
  return format(toDate(value), "MMM d, yyyy h:mm a");
}

export function formatDateOnly(value: Date | number | string) {
  return format(toDate(value), "MMM d, yyyy");
}

export function formatTimeOnly(value: Date | number | string) {
  return format(toDate(value), "h:mm a");
}

export function toDate(value: Date | number | string) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value);
  }

  return parseISO(value);
}

export function toInputDateTime(value: Date | number | string) {
  return format(toDate(value), "yyyy-MM-dd'T'HH:mm");
}

export function fromInputDateTime(value: string) {
  return parseISO(value);
}

export function getDayRange(date: Date | string) {
  const base = typeof date === "string" ? parseISO(date) : date;
  return {
    start: startOfDay(base),
    end: endOfDay(base),
  };
}

export function getWeekRange(date: Date) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getMonthRange(date: Date) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getCalendarRange(view: string, date: Date) {
  if (view === "month") {
    return getMonthRange(date);
  }

  if (view === "day") {
    return getDayRange(date);
  }

  return getWeekRange(date);
}

export function isUpcoming(value: Date | number | string) {
  return isAfter(toDate(value), new Date());
}

export function addOneDay(date: Date) {
  return addDays(date, 1);
}
