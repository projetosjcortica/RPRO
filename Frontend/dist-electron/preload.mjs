"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  loadData: (key) => ipcRenderer.invoke("load-data", key),
  saveData: (key, data) => ipcRenderer.invoke("save-data", key, data),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  selectFile: () => ipcRenderer.invoke("select-file"),
  cleanDB: () => ipcRenderer.invoke("clean-db"),
  //printer
  printPDF: (filePath) => ipcRenderer.invoke("print-pdf", filePath),
  // Save a base64-encoded PDF buffer to a temp file and return its path
  savePdf: (base64) => ipcRenderer.invoke("save-pdf", base64),
  // forked functions
  startFork: (script, args) => ipcRenderer.invoke("start-fork", { script, args }),
  // send an object/message to a forked child by pid
  sendToChild: (pid, msg) => ipcRenderer.invoke("send-to-child", { pid, msg }),
  // stop/kill a forked child by pid
  stopChild: (pid) => ipcRenderer.invoke("stop-child", { pid }),
  // event listeners from main (forwarded from child)
  onChildMessage: (fn) => ipcRenderer.on("child-message", (e, data) => fn(e, data)),
  onChildStdout: (fn) => ipcRenderer.on("child-stdout", (e, data) => fn(e, data)),
  onChildStderr: (fn) => ipcRenderer.on("child-stderr", (e, data) => fn(e, data)),
  onChildExit: (fn) => ipcRenderer.on("child-exit", (e, data) => fn(e, data))
});
