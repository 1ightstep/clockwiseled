import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.loadURL(process.env.VITE_DEV_SERVER_URL!)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
