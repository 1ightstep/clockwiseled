import { contextBridge, ipcRenderer } from "electron";
import { type DeviceType } from "./shared/type";
import { type ScheduleData } from "../src/shared/types";

contextBridge.exposeInMainWorld("serial", {
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
});

contextBridge.exposeInMainWorld("db", {
  getAllSchedules: (): Promise<ScheduleData[]> => {
    return ipcRenderer.invoke("db-get-all-schedules");
  },
  
  saveSchedule: (schedule: ScheduleData): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke("db-save-schedule", schedule);
  },
  
  deleteSchedule: (id: string | number): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke("db-delete-schedule", id);
  },
});
