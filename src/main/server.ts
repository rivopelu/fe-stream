import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Express } from 'express'
import multer from 'multer'
import { PassThrough } from 'stream'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
dotenv.config()

const app: Express = express()
const port = process.env.PORT || 9987
ffmpeg.setFfmpegPath(ffmpegPath)

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
const upload = multer({
  storage: multer.memoryStorage()
})

const videoStream = new PassThrough()
let isStreaming = false

function startStreaming() {
  if (isStreaming) return
  isStreaming = true
  ffmpeg(videoStream)
    .inputFormat('webm')
    .videoCodec('libx264')
    .audioCodec('aac')
    .outputOptions([
      '-preset veryfast',
      '-b:v 2500k',
      '-maxrate 4500k',
      '-bufsize 9000k',
      '-pix_fmt yuv420p',
      '-r 30',
      '-g 60',
      '-c:a aac',
      '-b:a 128k',
      '-ar 44100',
      '-f flv'
    ])
    .on('start', (commandLine) => {
      console.log('FFmpeg started:', commandLine)
    })
    .on('error', (err) => {
      console.error('FFmpeg error:', err)
      isStreaming = false
    })
    .on('end', () => {
      console.log('Streaming ended')
      isStreaming = false
    })
    .save('rtmp://a.rtmp.youtube.com/live2/rkt4-pju7-z1r9-t6w6-3h2e')
}

app.post('/stream', upload.single('video'), (req: any, res: any) => {
  if (!req.file || !req.file.buffer) {
    console.error('No video data received.')
    return res.status(400).send('No video data received.')
  }

  try {
    if (!isStreaming) {
      startStreaming()
    }

    videoStream.write(req.file.buffer)
    res.status(200).send('Chunk received')
  } catch (error) {
    console.error('Error processing chunk:', error)
    res.status(500).send('Error processing chunk')
  }
})

app.patch('/stop', (_, res) => {
  try {
    videoStream.end()
    isStreaming = false
    console.log('Streaming stopped')
    res.status(200).send('Streaming stopped')
  } catch (error) {
    console.error('Error stopping stream:', error)
    res.status(500).send('Error stopping stream')
  }
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
