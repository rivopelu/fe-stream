import { PassThrough } from 'stream'
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
export class StreamController {
  private isStreaming = false
  private videoStream = new PassThrough()

  public postSream(req: any, res: any) {
    if (!req.file || !req.file.buffer) {
      console.error('No video data received.')
      return res.status(400).send('No video data received.')
    }

    try {
      if (!this.isStreaming) {
        this.startStream()
      }

      this.videoStream.write(req.file.buffer)
      res.status(200).send('Chunk received')
    } catch (error) {
      console.error('Error processing chunk:', error)
      res.status(500).send('Error processing chunk')
    }
  }

  public stopStream(_, res: any) {
    try {
      this.videoStream.end()
      this.isStreaming = false
      console.log('Streaming stopped')
      res.status(200).send('Streaming stopped')
    } catch (error) {
      console.error('Error stopping stream:', error)
      res.status(500).send('Error stopping stream')
    }
  }

  private startStream() {
    if (this.isStreaming) return
    this.isStreaming = true
    ffmpeg(this.videoStream)
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
        this.isStreaming = false
      })
      .on('end', () => {
        console.log('Streaming ended')
        this.isStreaming = false
      })
      .save('rtmp://a.rtmp.youtube.com/live2/rkt4-pju7-z1r9-t6w6-3h2e')
  }
}
