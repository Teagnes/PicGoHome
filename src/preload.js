const { contextBridge, ipcRenderer } = require('electron')

// 安全地暴露有限的API给渲染进程
contextBridge.exposeInMainWorld('electronApi', {
  checkFileExists: (filePath) => ipcRenderer.invoke('check-file-exists', filePath),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  joinPath: (...paths) => ipcRenderer.invoke('join-path', ...paths),
  getFilesInDirectory: (dirPath) => ipcRenderer.invoke('get-files-in-directory', dirPath)
  // 其他 API 可按需添加
})