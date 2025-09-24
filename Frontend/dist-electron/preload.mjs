"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  loadData: (key) => electron.ipcRenderer.invoke("load-data", key),
  saveData: (key, data) => electron.ipcRenderer.invoke("save-data", key, data),
  selectFolder: () => electron.ipcRenderer.invoke("select-folder"),
  selectFile: () => electron.ipcRenderer.invoke("select-file"),
  cleanDB: () => electron.ipcRenderer.invoke("clean-db"),
  //printer
  printPDF: (filePath) => electron.ipcRenderer.invoke("print-pdf", filePath),
  // forked functions
  startFork: (script, args) => electron.ipcRenderer.invoke("start-fork", { script, args }),
  // send an object/message to a forked child by pid
  sendToChild: (pid, msg) => electron.ipcRenderer.invoke("send-to-child", { pid, msg }),
  // stop/kill a forked child by pid
  stopChild: (pid) => electron.ipcRenderer.invoke("stop-child", { pid }),
  // event listeners from main (forwarded from child)
  onChildMessage: (fn) => electron.ipcRenderer.on("child-message", (e, data) => fn(e, data)),
  onChildStdout: (fn) => electron.ipcRenderer.on("child-stdout", (e, data) => fn(e, data)),
  onChildStderr: (fn) => electron.ipcRenderer.on("child-stderr", (e, data) => fn(e, data)),
  onChildExit: (fn) => electron.ipcRenderer.on("child-exit", (e, data) => fn(e, data))
});
