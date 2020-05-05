const { ipcMain } = require('electron')
const { menubar } = require('menubar');

const DISABLED_ICON = `${__dirname}/icons/icon20.png`;
const ENABLED_ICON = `${__dirname}/icons/icon20-green-black.png`;

const mb = menubar({
  icon: DISABLED_ICON,
  preloadWindow: true,
  browserWindow: {
    frame: true,
    width: 350,
    icon: DISABLED_ICON,
    webPreferences: { nodeIntegration: true }
  }
});

ipcMain.on('set-enable', () => {
  mb.tray.setImage(ENABLED_ICON)
})

ipcMain.on('set-disable', () => {
  mb.tray.setImage(DISABLED_ICON)
})


mb.on('ready', () => {
  mb._browserWindow.setMenuBarVisibility(false);
});

// mb.on('after-create-window', () => {
//   mb.window.openDevTools()
// })
