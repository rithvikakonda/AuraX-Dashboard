

import React from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setActiveEffect, setGlitchIntensity, setNoiseIntensity, setRgbShiftIntensity } from "@/redux/features/studioSlice";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

const Effects: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeEffect, glitchIntensity, noiseIntensity, rgbShiftIntensity, availableEffects } = useAppSelector((state) => state.studio.effects);

  const getCurrentIntensity = () => {
    switch (activeEffect) {
      case 'glitch':
        return glitchIntensity;
      case 'noise':
        return noiseIntensity;
      case 'rgb':
        return rgbShiftIntensity;
      default:
        return 0;
    }
  };

  const handleIntensityChange = (value: number) => {
    switch (activeEffect) {
      case 'glitch':
        dispatch(setGlitchIntensity(value));
        break;
      case 'noise':
        dispatch(setNoiseIntensity(value));
        break;
      case 'rgb':
        dispatch(setRgbShiftIntensity(value));
        break;
    }
  };

  // Handle effect selection with toggle functionality
  const handleEffectClick = (effectId: "none" | "glitch" | "noise" | "rgb") => {
    // If the clicked effect is already active, set to 'none' (deselect it)
    if (activeEffect === effectId) {
      dispatch(setActiveEffect("none"));
    } else {
      // Otherwise, select the new effect
      dispatch(setActiveEffect(effectId));
    }
  };

  return (
    <div className="space-y-4 p-3 bg-white shadow-md rounded-lg max-w-sm">
      {/* Effects Selection - Flex container */}
      <div className="flex space-x-6">
        <div className="ml-6">
          <div className="flex flex-col space-y-3">
            {availableEffects.map((effect) => (
              <div
                key={effect.id}
                className={`cursor-pointer rounded-lg overflow-hidden transition-all transform hover:scale-105 ${
                  activeEffect === effect.id ? 'ring-2 ring-primary shadow-md' : 'ring-1 ring-gray-300'
                }`}
                onClick={() => handleEffectClick(effect.id as "none" | "glitch" | "noise" | "rgb")}
              >
                <div className="w-24 h-24 relative">
                  <img
                    src={effect.imageUrl}
                    alt={effect.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-1 text-center bg-gray-50">
                  <p className="text-xs font-medium text-gray-800">{effect.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Vertical Slider */}
        {activeEffect !== 'none' && (
          <div className="flex flex-col items-center justify-center px-2">
            <div className="h-40 flex flex-col items-center justify-center">
              <Slider
                id="effect-intensity"
                min={0}
                max={100}
                step={1}
                value={[getCurrentIntensity()]}
                onValueChange={(value) => handleIntensityChange(value[0])}
                orientation="vertical"
                className="h-full"
              />
              <span className="text-xs text-gray-500 mt-1">{getCurrentIntensity()}%</span>
            </div>
          </div>
        )}
      </div>
      <Separator className="my-2" />
      {activeEffect !== 'none' && (
        <div className="text-xs text-gray-500">
          {availableEffects.find(effect => effect.id === activeEffect)?.description}
        </div>
      )}
    </div>
  );
};

export default Effects;