const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path')
const crypto = require('crypto');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({ 
        width: 800, 
        height: 600, 
        fullscreenable: true,
        fullscreen: true,
        webPreferences: { 
            contextIsolation: true, // 启用上下文隔离
            nodeIntegration: false, // 禁用 Node.js 集成
            preload: path.join(__dirname, 'src/preload.js') // 指定 preload 脚本
        }
    });

    // mainWindow.loadURL('http://localhost:5173');
    mainWindow.loadFile('./dist/index.html')
    // mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    // mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`); 


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


//  将源目录和目标目录传入，返回源目录和目标目录的文件列表，以及源目录文件的MD5值，目标目录文件的MD5值，以及源目录文件的大小，目标目录文件的大小
ipcMain.handle('checkSouceFlie',async (event,sourcePath,targetPath) => {
  const fs = require('fs');
  const path = require('path');
  const files = [];
  const entries = fs.readdirSync(sourcePath, { withFileTypes: true });

  async function calculateMD5(filePath) {
  try {
    const fileBuffer = await fs.promises.readFile(filePath);
    const hash = crypto.createHash('md5');
    hash.update(fileBuffer);
    return hash.digest('hex');
  } catch (error) {
    console.error('计算 MD5 时出错:', error);
    return null;
  }
}

  for (const entry of entries) {
    // 跳过文件夹
    if (entry.isDirectory()) {
      continue;
    }
    let fileCheckMsg = '新文件'; //新文件 仅文件名相同 完全相同
    let fileCheckFlag = false;
    let sourceMd5 = '';
    let targetMd5 = '';
    const sourcefullPath = path.join(sourcePath, entry.name);
    const targetfullPath = path.join(targetPath, entry.name);
    console.log('sourcefullPath',sourcefullPath);
    console.log('targetfullPath',targetfullPath);
    console.log(fs.statSync(sourcefullPath).size);
    const stats = fs.statSync(sourcefullPath);
    // 判断目标文件夹是否存在该文件,，如果存在且文件大小也一样，则计算md5值，如果否则不计算md5值
    const targetStats = fs.existsSync(targetfullPath) ? fs.statSync(targetfullPath) : null;
    // 关于文件md5，如果目标文件夹存在该文件，则计算md5值，如果不存在，则不计算md5值
    if (targetStats && targetStats.size === stats.size) {
       sourceMd5 = await calculateMD5(sourcefullPath);
       targetMd5 = await calculateMD5(targetfullPath);
      if (sourceMd5 === targetMd5) {
        fileCheckMsg = '完全相同';
        fileCheckFlag = true;
      }
    }else if (targetStats && targetStats.size !== stats.size) {
      fileCheckMsg = '仅文件名相同';
      fileCheckFlag = true;
    }

    files.push({
      name: entry.name,
      fileCheckMsg,
      fileCheckFlag,
      path: sourcefullPath,
      size: stats.size,
      sourceMd5,
      targetMd5
    });
  }
  console.log('files',files);
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