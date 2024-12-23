import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import express, { Express, Request, Response } from 'express'
import { STREAM_KEY, STREAM_SERVER } from '../renderer/src/ENV'
import { PassThrough } from 'stream'
dotenv.config()
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)
const app: Express = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())
const upload = multer({
  storage: multer.memoryStorage()
})

const rtmpUrl = `${STREAM_SERVER}/${STREAM_KEY}`

app.get('/', (_: Request, res: Response) => {
  const command = ffmpeg('./video.mp4', { option: 'value' })

  command
    .outputOptions([
      '-r 30',
      '-c:v libx264',
      '-preset veryfast',
      '-b:v 2500k',
      '-maxrate 2500k',
      '-bufsize 9000k',
      '-c:a aac',
      '-b:a 128k',
      '-ar 44100',
      '-f flv'
    ])
    .inputOptions('-stream_loop -1')
    .on('start', (commandLine) => {
      console.log('FFmpeg started with command:', commandLine)
    })
    .on('progress', (progress) => {
      console.log(progress)
      console.log(`Processing: ${progress.frames} frames`)
    })
    .on('error', (err) => {
      console.error('Error:-', err)
    })
    .on('end', () => {
      console.log('Stream ended')
    })
    .save(rtmpUrl)

  res.send({ test: 'testing' })
})

app.post('/stream', upload.single('video'), (req: any, res) => {
  const videoStream = new PassThrough()
  videoStream.end(req.file.buffer) // Buffer data dari frontend
  console.log(videoStream)

  // Kirim video ke RTMP server
  ffmpeg(videoStream)
    .inputOptions([
      '-re',
      '-f webm', // Format input
      '-i pipe:0' // Input dari pipe
    ])
    .outputOptions([
      '-c:v libx264',
      '-preset veryfast',
      '-tune zerolatency',
      '-c:a aac',
      '-ar 44100',
      '-b:a 128k',
      '-f flv'
    ])
    .on('start', () => console.log('Streaming started...'))
    .on('error', (err) => console.error('Streaming error:', err))
    .on('end', () => console.log('Streaming ended.'))
    .output(rtmpUrl)
    .run()

  res.sendStatus(200)
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
