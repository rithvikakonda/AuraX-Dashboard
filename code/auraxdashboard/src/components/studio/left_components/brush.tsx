import React from 'react'
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { setBrushColor, setBrushHardness, setBrushSize } from "@/redux/features/studioSlice"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import ColorPickerBrush from './color_picker_brush'
import { Button } from '@/components/ui/button'

// Preset colors for quick selection
const colorPresets = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#00ffff', '#ff00ff',
];

const Brush = () => {
  const dispatch = useAppDispatch();
  const { brush } = useAppSelector((state) => state.studio);

  // Get color state based on type
  const getColorState = () => {
    return brush.color || '#000000';
  };

  // Calculate RGBA value from hex and opacity
  const getRgbaColor = () => {
    const color = getColorState();
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${brush.opacity / 100})`;
  };

  return (
    <div className="space-y-6">
      {/* Brush Size Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="brush-size" className="text-sm font-medium">Brush Size</Label>
          <span className="text-sm text-muted-foreground">{brush.size}px</span>
        </div>
        <Slider
          id="brush-size"
          min={1}
          max={100}
          step={1}
          value={[brush.size]} 
          className='cursor-pointer'
          onValueChange={(value) => dispatch(setBrushSize(value[0]))}
        />
      </div>

      {/* Brush Hardness Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="brush-hardness" className="text-sm font-medium">Hardness</Label>
          <span className="text-sm text-muted-foreground">{brush.hardness}%</span>
        </div>
        <Slider
          id="brush-hardness"
          min={0}
          max={100}
          step={1}
          value={[brush.hardness]} 
          className='cursor-pointer'
          onValueChange={(value) => dispatch(setBrushHardness(value[0]))}
        />
      </div>

      <Separator className="my-4" />

      {/* Color Picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Brush Color</Label>
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: getRgbaColor() }}
          />
        </div>

        {/* Color Presets */}
        <div>
          {colorPresets.map((color) => (
            <Button
              key={`font-${color}`}
              variant="outline"
              className="w-6 h-6 p-0 mr-1"
              style={{
                backgroundColor: color,
                border: brush.color === color ? '2px solid #0066ff' : '1px solid #ccc'
              }}
              onClick={() => dispatch(setBrushColor(color))}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        <ColorPickerBrush />
      </div>
    </div >
  )
}

export default Brush
