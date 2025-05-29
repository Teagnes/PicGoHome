const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// ... existing code ...

ipcMain.handle('copyFile', async (event, sourcePath, targetPath) => {
  try {
    await fs.promises.copyFile(sourcePath, targetPath);
    return { success: true };
  } catch (error) {
    console.error('复制文件时出错:', error);
    return { success: false, error: error.message };
  }
});

// ... existing code ...