

import React from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSelectedFilter, setFilterIntensity } from "@/redux/features/studioSlice";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Filters = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.studio);

  return (
    <div className="space-y-6 p-2">
      {/* Filter Selection Grid */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Filters</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {filters.availableFilters.map((filter) => (
            <div
              key={filter.id}
              className={`cursor-pointer rounded-md p-1 hover:bg-accent transition-colors ${
                filters.selectedFilter === filter.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => dispatch(setSelectedFilter(filter.id))}
            >
              <div 
                className={`h-14 w-full rounded ${filter.previewClass} mb-1`}
                aria-label={`${filter.name} preview`}
              />
              <p className="text-xs text-center truncate">{filter.name}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Filter Intensity Slider - only show if a filter is selected */}
      {filters.selectedFilter !== 'none' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="filter-intensity" className="text-sm font-medium">Intensity</Label>
            <span className="text-sm text-muted-foreground">{filters.filterIntensity}%</span>
          </div>
          <Slider
            id="filter-intensity"
            min={0}
            max={100}
            step={1}
            value={[filters.filterIntensity]}
            onValueChange={(value) => dispatch(setFilterIntensity(value[0]))}
          />
        </div>
      )}
    </div>
  );
};

export default Filters;
