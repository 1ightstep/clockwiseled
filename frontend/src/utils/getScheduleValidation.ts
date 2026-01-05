import { ScheduleData } from "@/shared/types";

export default function getScheduleValidation(schedule: ScheduleData) {
  if (!schedule.title?.trim())
    return { valid: false, reason: "Title is required" };
  if (!schedule.day) return { valid: false, reason: "Please select a day" };
  if (!schedule.events || schedule.events.length === 0) {
    return { valid: false, reason: "Schedule must have at least one event" };
  }

  for (const [index, event] of schedule.events.entries()) {
    const { startH, startM, endH, endM, r, g, b } = event;
    const eventNum = index + 1;

    const colors = { r, g, b };
    for (const [key, val] of Object.entries(colors)) {
      if (val < 0 || val > 255)
        return {
          valid: false,
          reason: `Event ${eventNum}: ${key.toUpperCase()} must be 0-255`,
        };
    }

    // range checks
    if (startH < 0 || startH > 23 || endH < 0 || endH > 23) {
      return {
        valid: false,
        reason: `Event ${eventNum}: Hours must be 0-23`,
      };
    }
    if (startM < 0 || startM > 59 || endM < 0 || endM > 59) {
      return {
        valid: false,
        reason: `Event ${eventNum}: Minutes must be 0-59`,
      };
    }

    // chron check
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    if (endTotal <= startTotal) {
      return {
        valid: false,
        reason: `Event ${eventNum}: End time must be after start time`,
      };
    }
  }

  return { valid: true };
}
