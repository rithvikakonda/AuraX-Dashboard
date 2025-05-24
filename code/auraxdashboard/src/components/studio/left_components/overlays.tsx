

import React from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedOverlay, setOverlayOpacity, setOverlayBlendMode } from "@/redux/features/studioSlice";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Overlays = () => {
  const dispatch = useAppDispatch();
  const { overlays } = useAppSelector((state) => state.studio);

  return (
    <div className="space-y-6 p-2">
      {/* Overlays Selection Grid */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Overlays</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {overlays.availableOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className={`cursor-pointer rounded-md p-1 hover:bg-accent transition-colors ${
                overlays.selectedOverlay === overlay.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => dispatch(setSelectedOverlay(overlay.id))}
            >
              <div 
                className={`h-14 w-full rounded ${overlay.previewClass} mb-1 bg-cover bg-center`}
                aria-label={`${overlay.name} preview`}
              />
              <p className="text-xs text-center truncate">{overlay.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Only show settings if an overlay is selected */}
      {overlays.selectedOverlay !== 'none' && (
        <>
          <Separator className="my-4" />

          {/* Overlay Opacity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="overlay-opacity" className="text-sm font-medium">Opacity</Label>
              <span className="text-sm text-muted-foreground">{overlays.overlayOpacity}%</span>
            </div>
            <Slider
              id="overlay-opacity"
              min={0}
              max={100}
              step={1}
              value={[overlays.overlayOpacity]}
              onValueChange={(value) => dispatch(setOverlayOpacity(value[0]))}
            />
          </div>

          {/* Blend Mode Selector */}
          <div className="space-y-2">
            <Label htmlFor="blend-mode" className="text-sm font-medium">Blend Mode</Label>
            <Select 
              value={overlays.overlayBlendMode}
              onValueChange={(value) => dispatch(setOverlayBlendMode(value))}
            >
              <SelectTrigger id="blend-mode" className="w-full">
                <SelectValue placeholder="Select blend mode" />
              </SelectTrigger>
              <SelectContent>
                {overlays.availableBlendModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
};

export default Overlays;