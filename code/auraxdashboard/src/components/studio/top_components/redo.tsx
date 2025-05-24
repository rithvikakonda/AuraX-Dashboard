import React from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { redoCanvasState } from '@/redux/features/studioSlice'
import { Button } from '@/components/ui/button'
import { Redo2 } from 'lucide-react'

const Redo = () => {
  const dispatch = useAppDispatch();
  const { canvasHistory, historyIndex } = useAppSelector((state) => state.studio);
  
  const handleRedo = () => {
    dispatch(redoCanvasState());
  }
  
  // Disable button if we're at the end of history
  const isDisabled = historyIndex >= canvasHistory.length - 1;
  
  return (
    <Button 
      onClick={handleRedo} 
      variant="ghost" 
      size="sm" 
      disabled={isDisabled}
      className="h-10"
    >
      <Redo2 className="h-5 w-5" />
      <span className="ml-2">Redo</span>
    </Button>
  )
}

export default Redo
