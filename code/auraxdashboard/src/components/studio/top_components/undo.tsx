import React from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { undoCanvasState } from '@/redux/features/studioSlice'
import { Button } from '@/components/ui/button'
import { Undo2 } from 'lucide-react'

const Undo = () => {
  const dispatch = useAppDispatch();
  const { historyIndex } = useAppSelector((state) => state.studio);
  
  const handleUndo = () => {
    dispatch(undoCanvasState());
  }
  
  // Disable button if we're at the beginning of history
  const isDisabled = historyIndex <= 0;
  
  return (
    <Button 
      onClick={handleUndo} 
      variant="ghost" 
      size="sm" 
      disabled={isDisabled}
      className="h-10"
    >
      <Undo2 className="h-5 w-5" />
      <span className="ml-2">Undo</span>
    </Button>
  )
}

export default Undo
