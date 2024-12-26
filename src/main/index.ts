import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, desktopCapturer, ipcMain, session, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
// import './server/server'
import ffmpeg from 'fluent-ffmpeg'
import { PassThrough } from 'stream'
ffmpeg.setFfmpegPath(ffmpegPath)

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1240,
    height: 720,
    minWidth: 1240,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
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

  ipcMain.on('ping', (_, title) => console.log(title))

  createWindow()
  streamLogic()
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

function streamLogic() {
  const videoStream = new PassThrough() // Stream untuk data video/audio
  let isStreaming = false
  function startStreaming() {
    isStreaming = true

    ffmpeg(videoStream)
      .inputFormat('webm')
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-preset ultrafast',
        '-b:v 1000k',
        '-maxrate 1300k',
        '-bufsize 500k',
        '-pix_fmt yuv420p',
        '-r 20',
        '-g 60',
        '-c:a aac',
        '-b:a 128k',
        '-ar 44100',
        '-f flv'
      ])
      .on('start', (commandLine) => {
        console.log('FFmpeg started:', commandLine)
      })
      .on('progress', (progress) => {
        console.log(progress)
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err.message)
        isStreaming = false
      })
      .on('end', () => {
        console.log('Streaming ended')
        isStreaming = false
      })
      .save('rtmp://127.0.0.1/live/S1C7Eo_rye')
  }

  // Handle event 'start-stream'
  // Tangani event IPC dari renderer process
  ipcMain.on('start-stream', (_, chunk) => {
    try {
      if (!isStreaming) {
        console.log('Starting streaming...')
        startStreaming()
      }

      const buffer = Buffer.from(chunk) // Pastikan data diubah ke buffer
      videoStream.write(buffer) // Tulis data ke stream
    } catch (error) {
      console.error('Error handling stream chunk:', error)
    }
  })

  ipcMain.on('stop-stream', () => {
    try {
      console.log('Stopping streaming...')
      videoStream.end() // Akhiri aliran data
      isStreaming = false
    } catch (error) {
      console.error('Error stopping stream:', error)
    }
  })
}
