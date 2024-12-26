import { Button, IconButton } from '@mui/material'
import { FaBeer } from 'react-icons/fa'

export function BottomBar() {
  return (
    <div className="border-t flex-1 w-full border-slate-800 flex flex-col justify-end items-end p-8">
      <div>
        <IconButton>
          <div className="text-white bg-blue-500 p-2 ">
            <FaBeer />
          </div>
        </IconButton>
        <Button size="large" variant="contained">
          Start Live
        </Button>
      </div>
    </div>
  )
}
