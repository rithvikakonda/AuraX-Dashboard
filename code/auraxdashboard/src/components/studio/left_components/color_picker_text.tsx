import React from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setFontColor, setBackgroundColor, setFontColorOpacity, setBackgroundColorOpacity } from "@/redux/features/studioSlice";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type ColorPickerProps = {
    colorType?: 'font' | 'background';
    textId: number;
};

const ColorPickerText: React.FC<ColorPickerProps> = ({ colorType, textId }) => {
    const dispatch = useAppDispatch();
    const { texts } = useAppSelector((state) => state.studio);

    // Get color state based on type
    const getColorState = () => {
        if (colorType === 'font') {
            return texts[textId].fontColor || '#000000';
        } else {
            return texts[textId].backgroundColor === 'transparent'
                ? '#ffffff'
                : texts[textId].backgroundColor || '#ffffff';
        }
    };

    // Handle color change based on type
    const handleColorChange = (color: string) => {
        if (colorType === 'font') {
            dispatch(setFontColor({
                id: texts[textId].id,
                value: color,
            }));
        } else {
            dispatch(setBackgroundColor({
                id: texts[textId].id,
                value: color,
            }));
        }
    };

    // Handle RGB input changes
    const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
        const color = getColorState();
        const hex = color.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        if (component === 'r') r = Math.max(0, Math.min(255, value));
        if (component === 'g') g = Math.max(0, Math.min(255, value));
        if (component === 'b') b = Math.max(0, Math.min(255, value));

        const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        handleColorChange(newColor);
    };

    const currentColor = getColorState();

    return (
        <div className="p-4 max-w-[240px]">
            {/* Color wheel */}
            <div className="mb-4">
                <HexColorPicker
                    color={currentColor}
                    onChange={handleColorChange}
                    className="w-full"
                />
            </div>

            {/* Color input and preview */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 text-xs text-gray-600">
                    <span>Hex: </span>
                    <HexColorInput
                        color={currentColor}
                        onChange={handleColorChange}
                        prefixed
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <div className="text-xs text-gray-600 mt-1 flex gap-1 items-center">
                        <span>RGB:</span>
                        <Input
                            type="number"
                            min="0"
                            max="255"
                            value={parseInt(currentColor.slice(1, 3), 16)}
                            onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                            className="w-14 h-6 px-1 text-xs"
                        />
                        <Input
                            type="number"
                            min="0"
                            max="255"
                            value={parseInt(currentColor.slice(3, 5), 16)}
                            onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                            className="w-14 h-6 px-1 text-xs"
                        />
                        <Input
                            type="number"
                            min="0"
                            max="255"
                            value={parseInt(currentColor.slice(5, 7), 16)}
                            onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                            className="w-14 h-6 px-1 text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* Opacity slider */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm">Opacity</Label>
                    <span className="text-sm">{colorType === "font" ? texts[textId].fontColorOpacity : texts[textId].backgroundColorOpacity}%</span>
                </div>
                <Slider
                    min={0}
                    max={100}
                    value={colorType === "font" ? [texts[textId].fontColorOpacity] : [texts[textId].backgroundColorOpacity]}
                    onValueChange={(value) => {
                        if (colorType === "font") {
                            dispatch(setFontColorOpacity({
                                id: texts[textId].id,
                                value: value[0],
                            }));
                        } else {
                            dispatch(setBackgroundColorOpacity(
                                {
                                    id: texts[textId].id,
                                    value: value[0],
                                }
                            ));
                        }
                    }}
                    className="h-1.5"
                />
            </div>
        </div>
    );
};

export default ColorPickerText;
