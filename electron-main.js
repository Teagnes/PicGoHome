const { app, BrowserWindow } = require('electron');
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({ 
        width: 800, 
        height: 600, 
        webPreferences: { 
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    mainWindow.loadURL('http://localhost:5173');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});