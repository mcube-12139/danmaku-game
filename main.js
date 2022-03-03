const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
    Menu.setApplicationMenu(null);
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        useContentSize: true,
        webPreferences: {
            // fuck electron
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, "preload.js")
        }
    });

    win.loadFile("index.html");

    ipcMain.on("debug", () => {
        win.webContents.openDevTools();
    });
    ipcMain.on("new-game", () => {
        win.loadFile("index.html");
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform != "darwin") {
        app.quit();
    }
});