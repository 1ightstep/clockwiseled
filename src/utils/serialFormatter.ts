import { ARDUINO_COMMANDS, SERIAL_CONFIG } from "@/constants";
import { type EventItem, type ScheduleData } from "@/shared/types";

export function formatSetClockCommand(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return `${ARDUINO_COMMANDS.SET_CLOCK} ${dayOfWeek} ${hours} ${minutes} ${seconds}`;
}

export function formatUploadCommand(dayIndex: number): string {
  return `${ARDUINO_COMMANDS.UPLOAD} ${dayIndex}`;
}

export function formatEventCommand(event: EventItem): string {
  return `${ARDUINO_COMMANDS.CONT_UPLOAD} ${event.startH} ${event.startM} ${event.endH} ${event.endM} ${event.r} ${event.g} ${event.b}`;
}

export function formatEndUploadCommand(): string {
  return ARDUINO_COMMANDS.END_UPLOAD;
}

export function buildScheduleCommands(
  dayIndex: number,
  schedule?: ScheduleData,
): string[] {
  const commands: string[] = [];

  commands.push(formatUploadCommand(dayIndex));

  if (schedule && schedule.events.length > 0) {
    schedule.events.forEach((event) => {
      commands.push(formatEventCommand(event));
    });
  }

  commands.push(formatEndUploadCommand());

  return commands;
}

export function buildCompleteSync(
  schedulesByDay: Record<string, ScheduleData | undefined>,
  dayIndices: Record<string, number>,
): string[] {
  const commands: string[] = [];

  commands.push(formatSetClockCommand());

  Object.entries(schedulesByDay).forEach(([dayName, schedule]) => {
    const dayIndex = dayIndices[dayName];
    if (dayIndex !== undefined) {
      const dayCommands = buildScheduleCommands(dayIndex, schedule);
      commands.push(...dayCommands);
    }
  });

  return commands;
}

export async function sendCommandSequence(commands: string[]): Promise<void> {
  for (const command of commands) {
    window.serial.write(command);
    await new Promise((resolve) =>
      setTimeout(resolve, SERIAL_CONFIG.COMMAND_DELAY_MS),
    );
  }
}
