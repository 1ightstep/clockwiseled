/// <reference types="vite-plugin-electron/electron-env" />

import { type DeviceType } from "./shared/type";
import { type ScheduleData } from "../src/shared/types";

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string
    VITE_PUBLIC: string
  }
}

interface Window {
  ipcRenderer: import('electron').IpcRenderer
  serial: {
    write: (data: string) => void;
    onData: (callback: (data: string) => void) => () => void;
    getDevices: () => Promise<DeviceType[]>;
    connectDevice: (port: string) => void;
  };
  db: {
    getAllSchedules: () => Promise<ScheduleData[]>;
    saveSchedule: (schedule: ScheduleData) => Promise<{ success: boolean }>;
    deleteSchedule: (id: string | number) => Promise<{ success: boolean }>;
  };
}
