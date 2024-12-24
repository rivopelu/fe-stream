import { STYLE_VARIABLE } from '@renderer/constants/style-variable'

export function LeftBar() {
  return (
    <div
      className="bg-slate-900 border-r border-slate-700 h-screen"
      style={{ width: STYLE_VARIABLE.SIZE.SIDEBAR_WIDTH }}
    >
      <iframe src="https://tikfinity.zerody.one/widget/viewercount?cid=855870" />
      <iframe
        width={'100%'}
        height={'70%'}
        className=""
        src="https://tikfinity.zerody.one/widget/chat?cid=855870"
      ></iframe>
    </div>
  )
}
