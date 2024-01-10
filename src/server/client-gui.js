const { app, BrowserWindow, Menu } = require('electron')
const createWindow = () => {
    Menu.setApplicationMenu(null)
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    })
    mainWindow.loadFile('./src/public/index.html')
}
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})