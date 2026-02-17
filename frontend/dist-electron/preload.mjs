"use strict";
const electron = require("electron");
const serialAPI = {
  write: (data) => {
    electron.ipcRenderer.send("serial-write", data);
  },
  onData: (callback) => {
    const listener = (_, data) => {
      callback(data);
    };
    electron.ipcRenderer.on("serial-data", listener);
    return () => {
      electron.ipcRenderer.removeListener("serial-data", listener);
    };
  },
  getDevices: () => {
    return electron.ipcRenderer.invoke("serial-devices");
  },
  connectDevice: (port) => {
    electron.ipcRenderer.send("serial-connect", port);
  }
};
const databaseAPI = {
  getAllSchedules: () => {
    return electron.ipcRenderer.invoke("db-get-all-schedules");
  },
  saveSchedule: (schedule) => {
    return electron.ipcRenderer.invoke("db-save-schedule", schedule);
  },
  deleteSchedule: (id) => {
    return electron.ipcRenderer.invoke("db-delete-schedule", id);
  }
};
electron.contextBridge.exposeInMainWorld("serial", serialAPI);
electron.contextBridge.exposeInMainWorld("db", databaseAPI);
