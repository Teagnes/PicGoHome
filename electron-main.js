const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path')

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({ 
        width: 800, 
        height: 600, 
        webPreferences: { 
            contextIsolation: true, // 启用上下文隔离
            nodeIntegration: false, // 禁用 Node.js 集成
            preload: path.join(__dirname, 'src/preload.js') // 指定 preload 脚本
        }
    });

    mainWindow.loadURL('http://localhost:5173');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

ipcMain.handle('open-directory-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return !result.canceled ? result.filePaths[0] : null;
});

ipcMain.handle('join-path', async (event, ...paths) => {
  const { join } = require('path');
  return join(...paths);
});

ipcMain.handle('check-file-exists', async (event, filePath) => {
  const fs = require('fs');
  return fs.existsSync(filePath);
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});