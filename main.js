const path = require('path')
const fs = require('fs')
const { app, BrowserWindow } = require('electron')
const settings = require("./settings.json")
const splits = require("./splits.json")

function createWindow () {
    const win = new BrowserWindow({
      width: settings["window"]["width"],
      height: settings["window"]["height"],
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
    }
    })
  
    // win.removeMenu()
    win.loadFile('index.html')
  }

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

  app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })