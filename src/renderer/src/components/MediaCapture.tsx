import axios from 'axios'
import { useRef, useState } from 'react'

export function MediaCapture() {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  /**
   * 📡 Start Live Stream
   */
  const startLiveStream = async () => {
    try {
      // 1. Access Screen and Audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080, frameRate: 30 },
        audio: true
      })
      // const stream = await navigator.mediaDevices.getDisplayMedia({
      // 	video: {
      // 		width: { ideal: 1920 },
      // 		height: { ideal: 1080 },
      // 		frameRate: { ideal: 30 },
      // 	},
      // 	audio: true,
      // });

      // 2. Display Stream in Video Element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // 3. Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8' // VP8 codec for WebM format
        // mimeType: 'video/mp4; codecs=avc1.42E01E'  // H.264 codec for MP4 format
      })

      // 4. Store MediaRecorder in Ref
      mediaRecorderRef.current = mediaRecorder

      // 5. Handle Data Available Event
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          try {
            const blob = event.data
            console.log('Chunk Blob size:', blob.size)
            await sendToServer(blob) // Send chunk to the server
          } catch (err) {
            console.error('Failed to send chunk:', err)
            setErrorMessage('Failed to send data to server.')
          }
        }
      }

      // 6. Handle Errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        setErrorMessage('MediaRecorder encountered an error.')
      }

      // 7. Start Recording
      mediaRecorder.start(1000) // Record in 1-second chunks
      setIsCameraActive(true)

      console.log('MediaRecorder started')
    } catch (error) {
      console.error('Error starting live stream:', error)
      setErrorMessage('Failed to start live stream. Please check permissions.')
    }
  }

  /**
   * 📤 Send Chunks to Server
   */
  const sendToServer = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('video', blob, 'chunk.webm')

      const response = await fetch('http://localhost:9987/stream', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      console.log('Chunk sent successfully')
    } catch (error) {
      console.error('Error sending chunk to server:', error)
      setErrorMessage('Failed to send data to server.')
    }
  }

  /**
   * 🛑 Stop Live Stream
   */
  const stopCamera = () => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        console.log('MediaRecorder stopped')
      }

      const stream = videoRef.current?.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      setIsCameraActive(false)

      axios.patch('http://localhost:9987/stop').then(() => {
        alert('OKE')
      })
    } catch (error) {
      console.error('Error stopping live stream:', error)
      setErrorMessage('Failed to stop the live stream.')
    }
  }

  return (
    <div>
      <h1>🎥 Media Capture</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <video ref={videoRef} autoPlay muted style={{ width: '600px', border: '1px solid black' }} />
      <div>
        {isCameraActive ? (
          <button onClick={stopCamera}>🛑 Stop Stream</button>
        ) : (
          <button onClick={startLiveStream}>▶️ Start Stream</button>
        )}
      </div>
    </div>
  )
}
