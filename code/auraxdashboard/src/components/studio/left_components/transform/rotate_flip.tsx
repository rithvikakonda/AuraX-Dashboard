import React from 'react'
import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setRotatedAngle ,FlipImageVertical ,FlipImageHorizontal,RotateImageCcw, RotateImageCw } from '@/redux/features/studioSlice';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

const RotateFlip = () => {
  const dispatch = useAppDispatch();
  const { transform } = useAppSelector((state) => state.studio)

  return (
    <Card className="p-4 rounded-lg w-fit mt-auto">
        <CardContent className="p-3">
          <Label className="text-sm text-gray-900 mb-3">Rotate & flip</Label>
          <div className="flex gap-2 justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="w-9 h-9 cursor-pointer" onClick={() => dispatch(RotateImageCcw())}>
                    <RotateCcw size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rotate Left</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="w-9 h-9  cursor-pointer" onClick={() => dispatch(RotateImageCw())}>
                    <RotateCw size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rotate Right</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="w-9 h-9 cursor-pointer" onClick={() => dispatch(FlipImageHorizontal())}>
                    <FlipHorizontal size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Flip Horizontal</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="w-9 h-9 cursor-pointer" onClick={() => dispatch(FlipImageVertical())}>
                    <FlipVertical size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Flip Vertical</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="space-y-2 py-3">
            <Label className="text-xs text-gray-900 py-3">Rotation: {transform.rotatedAngle}°</Label>
            <Slider
              defaultValue={[0]}
              min={0}
              max={360}
              step={1}
              className='cursor-pointer'
              value={[transform.rotatedAngle]}
              onValueChange={(value) => dispatch(setRotatedAngle(value[0]))}
            />
          </div>
        </CardContent>
      </Card>
  )
}

export default RotateFlip