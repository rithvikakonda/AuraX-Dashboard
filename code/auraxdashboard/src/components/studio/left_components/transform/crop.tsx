'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedAspect, setShowAspects, setTransformHeight, setTransformWidth, } from "@/redux/features/studioSlice";

// Helper for numeric input only
const handleNumericInput = (e: React.FormEvent<HTMLInputElement>) => {
  const value = e.currentTarget.value;
  e.currentTarget.value = value.replace(/[^0-9]/g, "");
  
};

// Crop options
const cropOptions = [
  { label: "Custom", icon: "dashed", w: 0 , h: 0 },
  { label: "Square", icon: "square" , w: 1 , h: 1 },
  { label: "4:3", icon: "landscape" , w: 4 , h: 3 },
  { label: "16:9", icon: "landscape-wide" , w: 16, h:9 },
  { label: "3:4", icon: "portrait", w:3 , h:4},
  { label: "9:16", icon: "portrait-tall", w:9, h:16 },
];

const facebookOptions = [
  { label: "Profile", icon: "facebook-profile", w: 1 , h: 1 },
  { label: "Title", icon: "facebook-title" , w: 2 , h: 1},
  { label: "Post", icon: "facebook-post" , w: 6 , h: 5},
];

const instagramOptions = [
  { label: "Landscape", icon: "instagram-Landscape" , w: 2 , h: 1},
  { label: "Portrait", icon: "instagram-Portrait", w: 4 , h: 5 },
  { label: "Square", icon: "instagram-Square" , w: 1 , h: 1},
  { label: "Story", icon: "instagram-Story", w: 9 , h: 16 },
];

const twitterOptions = [
  { label: "Post", icon: "twitter-Post", w: 2 , h: 1 },
  { label: "Profile", icon: "twitter-Profile", w: 1 , h: 1 },
  { label: "Title", icon: "twitter-Title", w: 3 , h: 1 },
];

const Crop = () => {
  const dispatch = useAppDispatch();
  const { transform, width, height } = useAppSelector((state) => state.studio);
  
  const handleAspectSelection = (option : typeof twitterOptions[0]) => {
    dispatch(setShowAspects(true)); // Enable cropping when selecting an aspect ratio
    
    if(option.label !== "Custom"){
      // Calculate the dimensions based on aspect ratio
      const aspectRatio = option.w / option.h;
      let newWidth, newHeight;
      
      // Default to using the full image width and adjusting height by aspect ratio
      newWidth = width;
      newHeight = Math.round(width / aspectRatio);
      
      // If the calculated height is greater than the image height, adjust width instead
      if (newHeight > height) {
        newHeight = height;
        newWidth = Math.round(height * aspectRatio);
      }
      
      dispatch(setSelectedAspect({
        width: option.w,
        height: option.h,
      }));
      
      // Update transform dimensions
      dispatch(setTransformWidth(newWidth));
      dispatch(setTransformHeight(newHeight));
    }
    else {
      dispatch(setSelectedAspect(null));
      dispatch(setTransformWidth(width));
      dispatch(setTransformHeight(height));
    }
  };

  // Helper function to calculate dimensions respecting aspect ratio
  const updateDimensionsWithAspect = (newWidth: number, newHeight: number) => {
    if (transform.selectedAspect) {
      const aspectRatio = transform.selectedAspect.width / transform.selectedAspect.height;
      
      // Update the other dimension based on which one was changed
      if (newWidth !== transform.width) {
        // Width was changed, adjust height
        dispatch(setTransformWidth(newWidth));
        dispatch(setTransformHeight(Math.round(newWidth / aspectRatio)));
      } else {
        // Height was changed, adjust width
        dispatch(setTransformHeight(newHeight));
        dispatch(setTransformWidth(Math.round(newHeight * aspectRatio)));
      }
    } else {
      // No aspect ratio constraint
      dispatch(setTransformWidth(newWidth));
      dispatch(setTransformHeight(newHeight));
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Main scrollable content */}
      <div className="flex-1 mb-4">
        {/* CROP SIZE */}
        <div className="py-2">
          <Label className="text-sm font-medium mb-2 text-gray-700">Crop Size</Label>
          <div className="flex items-center justify-between mt-2 space-x-4">
            <div className="flex items-center space-x-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Width"
                value={transform.width}
                min={0}
                onChange={(e) => {
                  if (e.target.value === "") {
                    updateDimensionsWithAspect(0, transform.height);
                  }
                  else {
                    updateDimensionsWithAspect(parseInt(e.target.value), transform.height);
                    dispatch(setShowAspects(true));
                  }
                }}
                className="w-20 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-1 text-center text-sm"
                onInput={handleNumericInput}
              />
              <span className="text-xs font-medium">W</span>
            </div>
            <span className="text-muted-foreground">×</span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Height"
                min={0}
                value={transform.height}
                onChange={(e) => {
                  if (e.target.value === "") {
                    updateDimensionsWithAspect(transform.width, 0);
                  }
                  else {
                    updateDimensionsWithAspect(transform.width, parseInt(e.target.value));
                    dispatch(setShowAspects(true));
                  }
                }}
                className="w-20 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-1 text-center text-sm"
                onInput={handleNumericInput}
              />
              <span className="text-xs font-medium">H</span>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* SELECT ASPECT TOGGLE */}
        <div>
          <div className="flex items-center justify-between px-3 py-2 text-gray-700 rounded-md transition-all duration-300">
            <Label className="text-sm cursor-pointer" htmlFor="aspect-toggle">Select aspect</Label>
            <Switch
              id="aspect-toggle"
              checked={transform.showAspects}
              className="cursor-pointer"
              onCheckedChange={(value) => dispatch(setShowAspects(value))}
            />
          </div>

          {transform.showAspects && (
            <>
              <div className="grid grid-cols-2 gap-2 mt-3 max-h-[30vh] overflow-y-auto overflow-x-hidden pr-1">
                {cropOptions.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={transform.selectedAspect && 
                            transform.selectedAspect.width === option.w && 
                            transform.selectedAspect.height === option.h 
                              ? "default" 
                              : "outline"}
                    className="flex flex-col items-center justify-center p-4 h-16 cursor-pointer"
                    size="sm"
                    onClick={() => handleAspectSelection(option)}
                  >
                    <span className="mt-1 text-xs">{option.label}</span>
                  </Button>
                ))}

                {/* Facebook Section */}
                <div className="col-span-2 flex items-center space-x-2 my-1">
                  <span className="text-xs text-gray-900 tracking-widest">FACEBOOK</span>
                </div>

                {facebookOptions.map((option, idx) => (
                  <Button
                    key={`facebook-${idx}`}
                    variant={transform.selectedAspect && 
                            transform.selectedAspect.width === option.w && 
                            transform.selectedAspect.height === option.h 
                              ? "default" 
                              : "outline"}
                    className="flex flex-col items-center justify-center p-4 h-16 cursor-pointer"
                    size="sm"
                    onClick={() => handleAspectSelection(option)}
                  >
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}

                {/* Instagram Section */}
                <div className="col-span-2 flex items-center space-x-2 my-1">
                  <span className="text-xs text-gray-900 tracking-widest">INSTAGRAM</span>
                </div>

                {instagramOptions.map((option, idx) => (
                  <Button
                    key={`instagram-${idx}`}
                    variant={transform.selectedAspect && 
                            transform.selectedAspect.width === option.w && 
                            transform.selectedAspect.height === option.h 
                              ? "default" 
                              : "outline"}
                    className="flex flex-col items-center justify-center p-4 h-16 cursor-pointer"
                    size="sm"
                    onClick={() => handleAspectSelection(option)}
                  >
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}

                {/* Twitter Section */}
                <div className="col-span-2 flex items-center space-x-2 my-1">
                  <span className="text-xs text-gray-900 tracking-widest">TWITTER</span>
                </div>

                {twitterOptions.map((option, idx) => (
                  <Button
                    key={`twitter-${idx}`}
                    variant={transform.selectedAspect && 
                            transform.selectedAspect.width === option.w && 
                            transform.selectedAspect.height === option.h 
                              ? "default" 
                              : "outline"}
                    className="flex flex-col items-center justify-center p-4 h-16 cursor-pointer"
                    size="sm"
                    onClick={() => handleAspectSelection(option)}
                  >
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crop;