import { useEffect } from 'react'
import { MediaCapture } from './components/MediaCapture'
import axios from 'axios'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  useEffect(() => {
    axios.get('http://localhost:3000').then((res) => console.log(res))
  }, [])

  return (
    <div>
      <button onClick={ipcHandle}>onCLICK</button>
      <MediaCapture />
      {/* <div>{data}</div> */}
    </div>
  )
}

export default App
