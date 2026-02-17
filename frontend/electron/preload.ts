import { contextBridge, ipcRenderer } from "electron";
import { type DeviceType } from "./shared/type";
import { type ScheduleData } from "../src/shared/types";

type SerialAPI = {
  write: (data: string) => void;
  onData: (callback: (data: string) => void) => () => void;
  getDevices: () => Promise<DeviceType[]>;
  connectDevice: (port: string) => void;
};

type DatabaseAPI = {
  getAllSchedules: () => Promise<ScheduleData[]>;
  saveSchedule: (schedule: ScheduleData) => Promise<{ success: boolean }>;
  deleteSchedule: (id: string | number) => Promise<{ success: boolean }>;
};

const serialAPI: SerialAPI = {
  write: (data: string) => {
    ipcRenderer.send("serial-write", data);
  },

  onData: (callback: (data: string) => void) => {
    const listener = (_: Electron.IpcRendererEvent, data: string) => {
      callback(data);
    };

    ipcRenderer.on("serial-data", listener);

    return () => {
      ipcRenderer.removeListener("serial-data", listener);
    };
  },

  getDevices: (): Promise<DeviceType[]> => {
    return ipcRenderer.invoke("serial-devices");
  },

  connectDevice: (port: string) => {
    ipcRenderer.send("serial-connect", port);
  },
};

const databaseAPI: DatabaseAPI = {
  getAllSchedules: (): Promise<ScheduleData[]> => {
    return ipcRenderer.invoke("db-get-all-schedules");
  },

  saveSchedule: (schedule: ScheduleData): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke("db-save-schedule", schedule);
  },

  deleteSchedule: (id: string | number): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke("db-delete-schedule", id);
  },
};

contextBridge.exposeInMainWorld("serial", serialAPI);
contextBridge.exposeInMainWorld("db", databaseAPI);
