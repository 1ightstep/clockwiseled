/// <reference types="vite-plugin-electron/electron-env" />

import type { ScheduleData } from "../src/shared/types";
import type { DeviceType } from "./shared/type";

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

interface Window {
  serial: {
    write: (data: string) => Promise<void>;
    onData: (callback: (data: string) => void) => () => void;
    onDisconnect: (callback: () => void) => () => void;
    getDevices: () => Promise<DeviceType[]>;
    connectDevice: (port: string) => Promise<{ success: boolean }>;
  };
  db: {
    getAllSchedules: () => Promise<ScheduleData[]>;
    saveSchedule: (schedule: ScheduleData) => Promise<{ success: boolean }>;
    deleteSchedule: (id: string | number) => Promise<{ success: boolean }>;
  };
}
