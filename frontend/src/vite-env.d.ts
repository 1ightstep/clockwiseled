/// <reference types="vite/client" />
export {};

import type { ScheduleData } from "./shared/types";

type DeviceType = {
  path: string;
  serialNumber?: string;
  manufacturer?: string;
};

declare global {
  interface Window {
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
}
