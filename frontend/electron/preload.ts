import { contextBridge, ipcRenderer } from "electron";
import { type DeviceType } from "./shared/type";

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
