import { STYLE_VARIABLE } from '@renderer/constants/style-variable'

export function LeftBar() {
  return (
    <div
      className="bg-slate-900 border-r border-slate-700 h-screen"
      style={{ width: STYLE_VARIABLE.SIDEBAR_WIDTH }}
    >
      <h1>HELLO WORLD</h1>
    </div>
  )
}
