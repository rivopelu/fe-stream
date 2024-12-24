import { Button } from '@mui/material'

export function BottomBar() {
  return (
    <div className="border-t flex-1 w-full border-slate-800 flex flex-col justify-end items-end p-8">
      <div>
        <Button variant="contained">Start Live</Button>
      </div>
    </div>
  )
}
