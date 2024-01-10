const { app, BrowserWindow, Menu } = require('electron')
const createWindow = () => {
    Menu.setApplicationMenu(null)
    const mainWindow = new BrowserWindow({
        width: 200,
        height: 0
    })
    mainWindow.loadFile('./src/server/gui.html')
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