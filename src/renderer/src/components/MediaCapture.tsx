import axios from 'axios'
import { useRef, useState } from 'react'

export function MediaCapture() {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startLiveStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080, frameRate: 30 },
        audio: true
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8'
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          try {
            const blob = event.data
            console.log('Chunk Blob size:', blob.size)
            // await sendToServer(blob)
          } catch (err) {
            console.error('Failed to send chunk:', err)
            setErrorMessage('Failed to send data to server.')
          }
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        setErrorMessage('MediaRecorder encountered an error.')
      }

      mediaRecorder.start(1000)
      setIsCameraActive(true)

      console.log('MediaRecorder started')
    } catch (error) {
      console.error('Error starting live stream:', error)
      setErrorMessage('Failed to start live stream. Please check permissions.')
    }
  }

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
    <div className=" h-full w-full">
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <video ref={videoRef} autoPlay muted style={{ width: '100%', border: '1px solid black' }} />
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
