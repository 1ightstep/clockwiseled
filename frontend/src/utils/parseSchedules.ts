import { type EventItem } from "@/shared/types";

export function parseSchedules(raw: string): Record<number, EventItem[]> {
  const result: Record<number, EventItem[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  // Split by schedule headers, keep the number
  const scheduleRegex = /_SCHEDULE_(\d+)_:\s*/g;

  let match: RegExpExecArray | null;
  const indices: { day: number; start: number }[] = [];

  // Collect all schedule header positions
  while ((match = scheduleRegex.exec(raw)) !== null) {
    indices.push({
      day: Number(match[1]),
      start: match.index + match[0].length,
    });
  }

  // Parse each schedule block
  for (let i = 0; i < indices.length; i++) {
    const { day, start } = indices[i];
    const end =
      i + 1 < indices.length
        ? indices[i + 1].start - indices[i + 1].day.toString().length - 12
        : raw.length;

    const block = raw.slice(start, end);

    if (block.includes("_NO_EVENT_")) continue;

    const eventRegex =
      /Event\s+(\d+):\s+\[(\d+):(\d+)\s*-\s*(\d+):(\d+)\]\s+RGB\((\d+),\s*(\d+),\s*(\d+)\)/g;

    let e: RegExpExecArray | null;

    while ((e = eventRegex.exec(block)) !== null) {
      const [_, eventIndex, startH, startM, endH, endM, r, g, b] = e;

      result[day].push({
        id: `D${day}-E${eventIndex}`,
        startH: Number(startH),
        startM: Number(startM),
        endH: Number(endH),
        endM: Number(endM),
        r: Number(r),
        g: Number(g),
        b: Number(b),
      });
    }
  }

  return result;
}
