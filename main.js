const path = require('path')
const fs = require('fs')
const { app, BrowserWindow, dialog, Menu } = require('electron')
const settings = require("./settings.json")
const splits = require("./splits.json")
const { windowsStore } = require('process')
const { MenuItem } = require('electron/main')

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
  
    win.on('resize', function () {
      var size   = win.getSize();
      var width  = size[0];
      var height = size[1];
      settings["window"]["width"] = width;
      settings["window"]["height"] = height;

      const data = JSON.stringify(settings, null, 8);
      fs.writeFile("./settings.json", data, (err) => {
        if (err) {
            throw err;
        }
    });
  });

    const isMac = process.platform === 'darwin'
    // win.removeMenu()
    const template = [
      {
        label: 'Settings',
        submenu: [
          {
            label : "change Settings",
            click: async () => {
              
                const winSet = new BrowserWindow({
                  width: 400,
                  height: 475,
                  resizable: false,
                  frame: false,
                  webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableRemoteModule: true,
                }})
                winSet.removeMenu()
                
                winSet.loadFile('settings.html')

            }
        }
        ]
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn',
            click: async () => {
              const { shell } = require('electron')
              await shell.openExternal('https://www.twitch.tv/mecke_dev')
            }
          }
        ]
      }
    ]
    
    const menu = Menu.buildFromTemplate(template)
    win.setMenu(menu)

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