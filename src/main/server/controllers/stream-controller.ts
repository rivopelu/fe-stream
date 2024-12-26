import { PassThrough } from 'stream'
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
import ffmpeg from 'fluent-ffmpeg'
ffmpeg.setFfmpegPath(ffmpegPath)

export function streamLogic(ipcMain: any) {
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
