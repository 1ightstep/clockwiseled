"use strict";
const electron = require("electron");
const serialAPI = {
  write: (data) => {
    return electron.ipcRenderer.invoke("serial-write", data);
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
    return electron.ipcRenderer.invoke("serial-connect", port);
  },
  onDisconnect: (callback) => {
    const listener = () => callback();
    electron.ipcRenderer.on("serial-disconnect", listener);
    return () => {
      electron.ipcRenderer.removeListener("serial-disconnect", listener);
    };
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
