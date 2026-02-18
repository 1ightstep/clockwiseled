import { ScheduleData } from "@/shared/types";

export type ValidationResult = {
  valid: boolean;
  reason?: string;
};

export function getScheduleValidation(
  schedule: ScheduleData,
): ValidationResult {
  if (!schedule.title?.trim())
    return { valid: false, reason: "Title is required" };
  if (!schedule.day) return { valid: false, reason: "Please select a day" };

  if (!schedule.events || schedule.events.length === 0) {
    return { valid: false, reason: "Schedule must have at least one event" };
  }

  const sorted = [...schedule.events].sort(
    (a, b) => a.startH * 60 + a.startM - (b.startH * 60 + b.startM),
  );

  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i];
    const { startH, startM, endH, endM, r, g, b } = event;
    const eventNum = i + 1;

    if ([r, g, b].some((v) => v < 0 || v > 255)) {
      return { valid: false, reason: `Event ${eventNum}: RGB must be 0-255` };
    }

    if (startH < 0 || startH > 23 || endH < 0 || endH > 23) {
      return { valid: false, reason: `Event ${eventNum}: Hours must be 0-23` };
    }
    if (startM < 0 || startM > 59 || endM < 0 || endM > 59) {
      return {
        valid: false,
        reason: `Event ${eventNum}: Minutes must be 0-59`,
      };
    }

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    if (endTotal <= startTotal) {
      return {
        valid: false,
        reason: `Event ${eventNum}: End must be after start`,
      };
    }

    if (i < sorted.length - 1) {
      const nextStart = sorted[i + 1].startH * 60 + sorted[i + 1].startM;
      if (endTotal > nextStart) {
        return {
          valid: false,
          reason: `Event ${eventNum} overlaps with next event`,
        };
      }
    }
  }

  return { valid: true };
}
