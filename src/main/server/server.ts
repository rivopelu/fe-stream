import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Express } from 'express'
import ffmpeg from 'fluent-ffmpeg'
import multer from 'multer'
import { StreamController } from './controllers/stream-controller'

dotenv.config()
ffmpeg.setFfmpegPath(ffmpegPath)

const app: Express = express()
const port = process.env.PORT || 9987

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())

const upload = multer({
  storage: multer.memoryStorage()
})

const streamController = new StreamController()

app.post('/stream', upload.single('video'), streamController.postSream)
app.patch('/stop', streamController.stopStream)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
