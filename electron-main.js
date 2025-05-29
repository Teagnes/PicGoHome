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

ipcMain.handle('get-files-in-directory', async (event, dirPath) => {
  const fs = require('fs');
  const path = require('path');
  const files = [];
  
  function traverseDirectory(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        traverseDirectory(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        files.push({
          name: entry.name,
          path: fullPath,
          size: stats.size,
          md5: '' // 这里需要额外的库来计算 MD5
        });
      }
    }
  }
  
  traverseDirectory(dirPath);
  return files;
});

ipcMain.handle('copyFile', async (event, sourcePath, targetPath) => {
  const fs = require('fs');
  try {
    await fs.promises.copyFile(sourcePath, targetPath);
    return { success: true };
  } catch (error) {
    console.error('复制文件时出错:', error);
    return { success: false, error: error.message };
  }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});