"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  loadData: (key) => electron.ipcRenderer.invoke("load-data", key),
  saveData: (key, data) => electron.ipcRenderer.invoke("save-data", key, data),
  selectFolder: () => electron.ipcRenderer.invoke("select-folder"),
  selectFile: () => electron.ipcRenderer.invoke("select-file"),
  cleanDB: () => electron.ipcRenderer.invoke("clean-db")
});
