export const ARDUINO_COMMANDS = {
  SET_CLOCK: "SET_CLOCK",
  SET_MAX_LEDS: "SET_MAX_LEDS",
  UPLOAD: "UPLOAD",
  CONT_UPLOAD: "CONT_UPLOAD",
  END_UPLOAD: "END_UPLOAD",
  GET_ALL_SCHEDULES: "GET_ALL_SCHEDULES",
  GET_SCHEDULE: "GET_SCHEDULE",
  STATUS: "STATUS",
  ON: "ON",
  OFF: "OFF",
  SET: "SET",
  INC: "INC",
  DEC: "DEC",
} as const;

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
} as const;

export const SERIAL_CONFIG = {
  BAUD_RATE: 9600,
  DELIMITER: "\n",
  COMMAND_DELAY_MS: 100,
  CONNECTION_TIMEOUT_MS: 1500,
  COMMAND_SEND_DELAY_MS: 150,
  ARDUINO_BOOT_DELAY_MS: 2000,
} as const;

export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
} as const;

export const TOAST_TYPE = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
} as const;
export const UI = {
  ICON_SIZES: {
    SMALL: 14,
    MEDIUM: 18,
    LARGE: 20,
    XLARGE: 24,
  },
  GAPS: {
    XS: "8px",
    SM: "12px",
  },
} as const;

export const DEFAULT_COLORS = {
  RGB: {
    R: 182,
    G: 167,
    B: 193,
  },
} as const;

export const DEFAULT_EVENT = {
  START_HOUR: 12,
  START_MINUTE: 0,
  END_HOUR: 13,
  END_MINUTE: 0,
} as const;

export const DEVICE_CONFIG = {
  REFRESH_INTERVAL_MS: 1000,
  MAX_LEDS: 75,
  MIN_LEDS: 0,
} as const;
