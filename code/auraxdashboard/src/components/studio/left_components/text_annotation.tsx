import React, { useState } from 'react';
import ColorPickerText from './color_picker_text';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { AlignLeft, AlignCenter, AlignRight, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { setBackgroundColor, setFontColor, setFontFamily, setFontSize, setLineSpacing, setTextAlign, addNewText } from '@/redux/features/studioSlice';

const fontStyles = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
];

const TextAnnotation = () => {
  const dispatch = useAppDispatch();
  const { texts, selectedTextId } = useAppSelector((state) => state.studio);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  if (selectedTextId === null) {
    return (
      <div className="space-y-4 p-4">
        <Button
          className="w-full flex items-center justify-center gap-2 cursor-pointer"
          variant="default"
          onClick={() => dispatch(addNewText())}
        >
          New Text
        </Button>
      </div>
    );
  }

  // Color presets for quick selection
  const colorPresets = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#00ffff', '#ff00ff', '#808080', '#800000',
  ];

  const handleColorSelect = (type: 'font' | 'background', color: string) => {
    if (type === 'font') {
      dispatch(setFontColor({
        id: texts[selectedTextId].id,
        value: color,
      }));
      setShowFontColorPicker(false);
    } else {
      dispatch(setBackgroundColor({
        id: texts[selectedTextId].id,
        value: color,
      }));
      setShowBgColorPicker(false);
    }
  };

  // Get color state based on type
  const getColorState = (colorType: "font" | "background") => {
    if (colorType === 'font') {
      return texts[selectedTextId].fontColor || '#000000';
    } else {
      return texts[selectedTextId].backgroundColor === 'transparent'
        ? '#ffffff'
        : texts[selectedTextId].backgroundColor || '#ffffff';
    }
  };

  // Calculate RGBA value from hex and opacity
  const getRgbaColor = (colorType: "font" | "background") => {
    const color = getColorState(colorType);
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const opacity = colorType === "font" ? texts[selectedTextId].fontColorOpacity : texts[selectedTextId].backgroundColorOpacity;
    if (colorType === 'background' && texts[selectedTextId].backgroundColor === 'transparent') {
      return 'rgba(255, 255, 255, 0)';
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  return (
    <div className="space-y-4 p-4">
      {/* Add New Text Button */}
      <Button
        className="w-full flex items-center justify-center gap-2 cursor-pointer"
        variant="default"
        onClick={() => dispatch(addNewText())}
      >
        New Text
      </Button>

      {/* Font Style - Full Width */}
      <div className="space-y-2 w-full">
        <Label htmlFor="font-style">Font Style</Label>
        <Select
          value={texts[selectedTextId].fontFamily}
          onValueChange={(value) => dispatch(setFontFamily({
            id: texts[selectedTextId].id,
            value: value,
          }))}
        >
          <SelectTrigger id="font-style" className="w-full">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontStyles.map((font) => (
              <SelectItem key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                {font.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size - Number Input Field */}
      <div className="space-y-2 w-full">
        <Label htmlFor="font-size">Font Size</Label>
        <input
          id="font-size"
          type="number"
          min="1"
          value={texts[selectedTextId].fontSize}
          className="w-20 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-1 text-center text-sm"
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (value > 0) {
              dispatch(setFontSize({
                id: texts[selectedTextId].id,
                value: value,
              }));
            }
          }}
        />
        <span className="ml-2 text-sm text-muted-foreground">px</span>
      </div>

      {/* Text Alignment - Separate Row */}
      <div className="space-y-2">
        <Label>Alignment</Label>
        <div className="flex gap-1">
          <Button
            variant={texts[selectedTextId].textAlign === 'left' ? "secondary" : "outline"}
            onClick={() => dispatch(setTextAlign({
              id: texts[selectedTextId].id,
              value: "left",
            }))}
            aria-label="Align left"
          >
            <AlignLeft size={16} />
          </Button>
          <Button
            variant={texts[selectedTextId].textAlign === 'center' ? "secondary" : "outline"}
            onClick={() => dispatch(setTextAlign(
              {
                id: texts[selectedTextId].id,
                value: "center",
              }
            ))}
            aria-label="Align center"
          >
            <AlignCenter size={16} />
          </Button>
          <Button
            variant={texts[selectedTextId].textAlign === 'right' ? "secondary" : "outline"}
            onClick={() => dispatch(setTextAlign({
              id: texts[selectedTextId].id,
              value: "right",
            }))}
            aria-label="Align right"
          >
            <AlignRight size={16} />
          </Button>
        </div>
      </div>

      {/* Font Color Selection */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Font Color</Label>
          <Popover
            open={showFontColorPicker}
            onOpenChange={(open) => setShowFontColorPicker(open)}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-input"
                  style={{ backgroundColor: getRgbaColor("font") }}
                ></div>
                <ChevronDown size={12} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <ColorPickerText colorType="font" textId={selectedTextId} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Color Presets */}
        <div className="grid grid-cols-5 gap-1">
          {colorPresets.map((color) => (
            <Button
              key={`font-${color}`}
              variant="outline"
              className="w-6 h-6 p-0"
              style={{
                backgroundColor: color,
                border: texts[selectedTextId].fontColor === color ? '2px solid #0066ff' : '1px solid #ccc'
              }}
              onClick={() => handleColorSelect('font', color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Background Color Selection */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Background Color</Label>
          <Popover
            open={showBgColorPicker}
            onOpenChange={(open) => setShowBgColorPicker(open)}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2 flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-input"
                  style={{
                    backgroundColor: getRgbaColor("background"),
                    backgroundImage: texts[selectedTextId].backgroundColor === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 4px 4px'
                  }}
                ></div>
                <ChevronDown size={12} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <ColorPickerText colorType="background" textId={selectedTextId} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Color Presets with Transparent Option */}
        <div className="grid grid-cols-5 gap-1">
          <Button
            variant="outline"
            className="w-6 h-6 p-0"
            style={{
              backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 4px 4px',
              border: texts[selectedTextId].backgroundColor === 'transparent' ? '2px solid #0066ff' : '1px solid #ccc'
            }}
            onClick={() => handleColorSelect('background', 'transparent')}
            aria-label="Transparent background"
          />
          {colorPresets.slice(0, 9).map((color) => (
            <Button
              key={`bg-${color}`}
              variant="outline"
              className="w-6 h-6 p-0"
              style={{
                backgroundColor: color,
                border: texts[selectedTextId].backgroundColor === color ? '2px solid #0066ff' : '1px solid #ccc'
              }}
              onClick={() => handleColorSelect('background', color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Line Spacing */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Line Spacing</Label>
          <span className="text-sm">{texts[selectedTextId].lineSpacing.toFixed(1)}</span>
        </div>
        <Slider
          min={1}
          max={3}
          step={0.1}
          className='cursor-pointer'
          value={[texts[selectedTextId].lineSpacing]}
          onValueChange={(value) => dispatch(setLineSpacing({
            id: texts[selectedTextId].id,
            value: value[0],
          }))}
        />
      </div>
    </div>
  );
};

export default TextAnnotation;
