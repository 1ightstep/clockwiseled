export const ARDUINO_COMMANDS = {
  SET_CLOCK: "SET_CLOCK",
  UPLOAD: "UPLOAD",
  CONT_UPLOAD: "CONT_UPLOAD",
  END_UPLOAD: "END_UPLOAD",
  GET_SCHEDULE: "GET_SCHEDULE",
  ON: "ON",
  OFF: "OFF",
  SET: "SET",
  INC: "INC",
  DEC: "DEC",
  STATUS: "STATUS",
} as const;

export const ARDUINO_RESPONSES = {
  SUCCESS_PREFIX: "_SUCCESS_",
  ERROR_BAD_DAY: "_ERR_BAD_DAY_",
  ERROR_FIELDS: "_ERR_FIELDS_",
  ERROR_MAX_EVENTS: "_ERR_MAX_EVENTS_",
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
  WARNING: "warning",
} as const;
