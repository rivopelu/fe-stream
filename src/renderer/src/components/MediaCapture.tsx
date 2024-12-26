import { useEffect, useRef, useState } from 'react'

const ipcHandle = async (data: Blob) => {
  const arrayBuffer = await data.arrayBuffer() // Konversi Blob ke ArrayBuffer
  const uint8Array = new Uint8Array(arrayBuffer) // Konversi ke Uint8Array
  window.electron.ipcRenderer.send('start-stream', uint8Array)
}

export function MediaCapture() {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [networkStatus, setNetworkStatus] = useState<string>('Checking...')

  const monitorNetwork = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const updateStatus = () => {
        const type = connection.effectiveType
        const downlink = connection.downlink
        const rtt = connection.rtt

        setNetworkStatus(`Type: ${type}, Downlink: ${downlink} Mbps, RTT: ${rtt} ms`)
      }

      updateStatus()
      connection.addEventListener('change', updateStatus)

      return () => connection.removeEventListener('change', updateStatus)
    } else {
      setNetworkStatus('Network Information API not supported')
    }
  }

  useEffect(() => {
    const cleanup = monitorNetwork()
    return cleanup // Hapus listener saat komponen di-unmount
  }, [])

  const startLiveStream = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: true // Menangkap audio dari layar
      })

      if (videoRef.current) {
        videoRef.current.srcObject = displayStream
      }

      // Rekam video dan audio
      const mediaRecorder = new MediaRecorder(displayStream, {
        mimeType: 'video/webm; codecs=vp8,opus'
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          try {
            const blob = event.data
            console.log('Chunk Blob size:', blob.size)
            await sendToServer(blob) // Kirim data ke main process
          } catch (err) {
            console.error('Failed to send chunk:', err)
            setErrorMessage('Failed to send data to main process.')
          }
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        setErrorMessage('MediaRecorder encountered an error.')
      }

      mediaRecorder.start(1000) // Rekam setiap 1 detik
      setIsCameraActive(true)

      console.log('MediaRecorder started')
    } catch (error) {
      console.error('Error starting live stream:', error)
      setErrorMessage('Failed to start live stream. Please check permissions.')
    }
  }

  const sendToServer = async (blob: Blob) => {
    try {
      await ipcHandle(blob) // Kirim data ke Electron Main Process
    } catch (error) {
      console.error('Error sending chunk to main process:', error)
      setErrorMessage('Failed to send data to main process.')
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
    } catch (error) {
      console.error('Error stopping live stream:', error)
      setErrorMessage('Failed to stop the live stream.')
    }
  }

  return (
    <div className="h-full w-full">
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <div>
        <p>Network Status: {networkStatus}</p>
      </div>
      <video
        className="bg-black"
        ref={videoRef}
        autoPlay
        muted
        style={{ width: '100%', border: '1px solid black' }}
      />
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
