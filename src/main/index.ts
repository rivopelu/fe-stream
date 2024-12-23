import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, desktopCapturer, ipcMain, session, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
// import './server'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true, // harus true untuk security
      webviewTag: true,
      webSecurity: true
    }
  })
  session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' })
    })
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  session.defaultSession.setPermissionRequestHandler(function (_: any, permission: any, callback) {
    if (permission === 'media') {
      callback(true) // Allow access to media devices
    } else {
      callback(false)
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // let ffmpegProcess: any = null

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('start-stream', () => {
    // ffmpegProcess = spawn('ffmpeg', [
    //   '-y',
    //   '-i',
    //   '-',
    //   '-c:v',
    //   'libx264',
    //   '-preset',
    //   'veryfast',
    //   '-tune',
    //   'zerolatency',
    //   '-b:v',
    //   '3000k',
    //   '-f',
    //   'flv',
    //   streamData.rtmpUrl // Stream URL from renderer
    // ])

    // ffmpegProcess.stderr.on('data', (data) => {
    //   console.error(`FFmpeg stderr: ${data}`)
    // })

    // ffmpegProcess.on('close', (code) => {
    //   console.log(`FFmpeg process exited with code ${code}`)
    // })
    console.log('HELLO')
  })

  // ipcMain.on('stop-stream', () => {
  //   if (ffmpegProcess) {
  //     ffmpegProcess.stdin.end()
  //     ffmpegProcess.kill('SIGINT')
  //   }
  // })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
