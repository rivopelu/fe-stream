import { useRef, useState } from 'react'

export function MediaCapture() {
  const [errorMessage] = useState<string>('')
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const videoRef = useRef<any>(null)
  const mediaRecorderRef = useRef<any>(null)
  const chunks = useRef<any>([])

  const ipcLiveTest = (): void => window.electron.ipcRenderer.send('ping')

  const startLiveStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8'
      })

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const blob = event.data
          // const buffer = await blob.arrayBuffer()
          // console.log(buffer)
          sendToServer(blob)
        }
      }

      mediaRecorder.start(1000) // Kirim setiap detik

      setIsCameraActive(true)
    } catch (error) {
      console.error('Error starting live stream:', error)
    }
  }

  const sendToServer = async (chunk) => {
    const formData = new FormData()
    formData.append('video', chunk)

    try {
      await fetch('http://localhost:3000/test', {
        method: 'POST',
        body: formData
      })
    } catch (error) {
      console.error('Error sending video chunk:', error)
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    setIsCameraActive(false)
  }

  return (
    <div>
      <h1>Media Capture</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <video ref={videoRef} autoPlay muted style={{ width: '600px', border: '1px solid black' }} />
      <div>
        {isCameraActive ? (
          <button onClick={stopCamera}>Stop Camera</button>
        ) : (
          <button onClick={startLiveStream}>Start Camera</button>
        )}
      </div>
    </div>
  )
}
