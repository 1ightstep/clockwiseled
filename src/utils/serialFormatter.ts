import { ARDUINO_COMMANDS, SERIAL_CONFIG } from "@/constants";
import { type EventItem, type ScheduleData } from "@/shared/types";

export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type TinkerCommandInput = {
  type:
    | typeof ARDUINO_COMMANDS.ON
    | typeof ARDUINO_COMMANDS.OFF
    | typeof ARDUINO_COMMANDS.SET
    | typeof ARDUINO_COMMANDS.INC
    | typeof ARDUINO_COMMANDS.DEC
    | typeof ARDUINO_COMMANDS.SET_MAX_LEDS
    | typeof ARDUINO_COMMANDS.SET_CLOCK
    | typeof ARDUINO_COMMANDS.STATUS
    | typeof ARDUINO_COMMANDS.GET_SCHEDULE;
  value: string;
  side: "l" | "r";
  color: RgbColor;
};

export function formatSetClockCommand(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return `${ARDUINO_COMMANDS.SET_CLOCK} ${dayOfWeek} ${hours} ${minutes} ${seconds}`;
}

export function formatSetMaxLedsCommand(count: number): string {
  return `${ARDUINO_COMMANDS.SET_MAX_LEDS} ${count}`;
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

export function formatOnCommand(color: RgbColor): string {
  return `${ARDUINO_COMMANDS.ON} ${color.r} ${color.g} ${color.b}`;
}

export function formatOffCommand(): string {
  return ARDUINO_COMMANDS.OFF;
}

export function formatSetCommand(value: string, color: RgbColor): string {
  return `${ARDUINO_COMMANDS.SET} ${value} ${color.r} ${color.g} ${color.b}`;
}

export function formatIncCommand(
  value: string,
  side: "l" | "r",
  color: RgbColor,
): string {
  return `${ARDUINO_COMMANDS.INC} ${value} ${side} ${color.r} ${color.g} ${color.b}`;
}

export function formatDecCommand(value: string, side: "l" | "r"): string {
  return `${ARDUINO_COMMANDS.DEC} ${value} ${side}`;
}

export function formatTinkerCommand(input: TinkerCommandInput): string {
  const { type, value, side, color } = input;

  if (type === ARDUINO_COMMANDS.OFF) return formatOffCommand();
  if (type === ARDUINO_COMMANDS.ON) return formatOnCommand(color);
  if (type === ARDUINO_COMMANDS.SET) return formatSetCommand(value, color);
  if (type === ARDUINO_COMMANDS.INC)
    return formatIncCommand(value, side, color);
  if (type === ARDUINO_COMMANDS.SET_MAX_LEDS)
    return formatSetMaxLedsCommand(Number(value));
  if (type === ARDUINO_COMMANDS.SET_CLOCK) return formatSetClockCommand();
  if (type === ARDUINO_COMMANDS.STATUS) return ARDUINO_COMMANDS.STATUS;
  if (type === ARDUINO_COMMANDS.GET_SCHEDULE)
    return `${ARDUINO_COMMANDS.GET_SCHEDULE} ${value}`;
  return formatDecCommand(value, side);
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

export async function sendCommandSequence(
  commands: string[],
  delayMs: number = SERIAL_CONFIG.COMMAND_DELAY_MS,
): Promise<void> {
  for (const command of commands) {
    window.serial.write(command);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
