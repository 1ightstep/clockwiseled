export const SERIAL_CONFIG = {
  BAUD_RATE: 9600,
  DELIMITER: "\n",
} as const;

export const WINDOW_CONFIG = {
  TITLE: "Clockwise",
  ICON_PATH: "../public/Logo.png",
  PRELOAD_PATH: "preload.mjs",
} as const;

export const PLATFORM = {
  DARWIN: "darwin",
} as const;
