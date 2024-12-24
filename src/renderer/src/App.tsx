import { BottomBar } from './components/BottomBar'
import { LeftBar } from './components/LeftBar'
import { MediaCapture } from './components/MediaCapture'
import { RightBar } from './components/RightBar'

function App(): JSX.Element {
  return (
    <div className=" relative h-screen w-screen">
      <div className="flex">
        <LeftBar />
        <div className="h-screen flex-1 w-screen fixed pointer-events-none bg-transparent flex items-center justify-center">
          {/* <iframe
            className="bg-blue-900 bg-transparent"
            width={'50%'}
            height={'50%'}
            src="https://tikfinity.zerody.one/widget/myactions?cid=855870&screen=1"
          /> */}
        </div>
        <div className="flex-1 min-h-screen flex items-center justify-center flex-col">
          <MediaCapture />
          <BottomBar />
        </div>
        <RightBar />
      </div>
    </div>
  )
}

export default App
