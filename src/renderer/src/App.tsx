import { LeftBar } from './components/LeftBar'
import { MediaCapture } from './components/MediaCapture'
import { RightBar } from './components/RightBar'

function App(): JSX.Element {
  return (
    <div className="flex">
      <LeftBar />
      <div className="flex-1 min-h-screen flex items-center justify-center flex-col">
        <MediaCapture />
      </div>
      <RightBar />
    </div>
  )
}

export default App
