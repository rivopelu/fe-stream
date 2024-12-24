import axios from 'axios'
import { useEffect, useRef, useState } from 'react'

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
    return cleanup // Hapus listener atau interval saat komponen di-unmount
  }, [])

  const startLiveStream = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: true // Menangkap audio dari layar
      })

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioElement = new Audio('https://webaudioapi.com/samples/audio-tag/chrono.mp3') // Path ke file audio Anda
      audioElement.loop = true // Atur supaya audio di-loop

      // Menunggu agar audio siap diputar
      await audioElement.play()

      // Membuat AudioContext untuk menangani audio
      const audioContext = new AudioContext()

      // Menghubungkan audioElement ke AudioContext
      const audioSourceNode = audioContext.createMediaElementSource(audioElement)

      // Membuat destination untuk mengambil audio stream
      const audioDestination = audioContext.createMediaStreamDestination()

      // Menghubungkan sourceNode ke destination
      audioSourceNode.connect(audioDestination)

      // Ambil audio track dari audio stream
      const audioFromAssetStream = audioDestination.stream
      // Gabungkan video layar dan audio mikrofon
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ])

      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream
      }

      // Rekam audio + video
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm; codecs=vp8,opus' // Pastikan mendukung audio
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
      const formData = new FormData()
      formData.append('video', blob, 'chunk.webm')

      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      } else {
        setErrorMessage('')
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
