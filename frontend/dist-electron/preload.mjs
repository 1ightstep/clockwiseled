"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("serial", {
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
});
