'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setBrightness, setContrast, setSaturation, setGamma, setConvolute } from "@/redux/features/studioSlice";

const BasicAdjustments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { basicAdjustments } = useAppSelector((state) => state.studio);

  const renderSlider = (
    label: string,
    value: number,
    setValue: typeof setBrightness | typeof setContrast | typeof setSaturation | typeof setGamma | typeof setConvolute 
  ) => (
    <div className="mb-4">
      <Label className="block text-sm text-muted-foreground mb-1">{label}</Label>
      <div className="flex items-center gap-3">
        <Slider
          min={-100}
          max={100}
          step={1}
          value={[value]}
          onValueChange={([val]) => dispatch(setValue(val))}
          className="flex-1 cursor-pointer"
        />
        <span className="text-sm text-muted-foreground w-10 text-right">{value}</span>
      </div>
    </div>
  );

  return (
    <Card className="w-72 p-4 ">
      <div>
        {renderSlider('Brightness', basicAdjustments.brightness, setBrightness)}
        {renderSlider('Contrast', basicAdjustments.contrast, setContrast)}
        {renderSlider('Saturation', basicAdjustments.saturation, setSaturation)}
        {renderSlider('Gamma', basicAdjustments.gamma, setGamma)}
        {renderSlider('Convolute', basicAdjustments.convolute, setConvolute)}
      </div>
    </Card>
  );
};

export default BasicAdjustments;