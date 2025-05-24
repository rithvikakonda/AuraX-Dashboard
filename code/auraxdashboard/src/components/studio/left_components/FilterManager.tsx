

import { fabric } from 'fabric';

// Define filter presets with their configuration
export const filterPresets = {
  none: () => [],
  sepia: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.Sepia({
        opacity: intensity / 100
      })
    ];
  },
  vintage: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.Vintage({
        opacity: intensity / 100
      })
    ];
  },

  vibrant: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.Saturation({
        saturation: intensity / 50 // More vibrant
      }),
      new fabric.Image.filters.Contrast({
        contrast: intensity / 200
      })
    ];
  },
  cool: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.ColorMatrix({
        matrix: [
          1, 0, 0, 0, 0,
          0, 1, 0, 0, 0,
          0, 0, 1, 0, intensity / 50,
          0, 0, 0, 1, 0
        ]
      })
    ];
  },
  warm: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.ColorMatrix({
        matrix: [
          1, 0, 0, 0, intensity / 50,
          0, 1, 0, 0, intensity / 100,
          0, 0, 1, 0, -intensity / 100,
          0, 0, 0, 1, 0
        ]
      })
    ];
  },
  dramatic: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.Contrast({
        contrast: intensity / 50
      }),
      new fabric.Image.filters.Brightness({
        brightness: -intensity / 200
      })
    ];
  },
  grayscale: (intensity: number) => {
    if (intensity === 0) return [];
    // Fabric.js Grayscale filter doesn't support intensity natively,
    // so simulate it by blending between normal and full grayscale
    const factor = intensity / 100;
    return [
      new fabric.Image.filters.ColorMatrix({
        matrix: [
          0.2126 + 0.7874 * (1 - factor), 0.7152 - 0.7152 * (1 - factor), 0.0722 - 0.0722 * (1 - factor), 0, 0,
          0.2126 - 0.2126 * (1 - factor), 0.7152 + 0.2848 * (1 - factor), 0.0722 - 0.0722 * (1 - factor), 0, 0,
          0.2126 - 0.2126 * (1 - factor), 0.7152 - 0.7152 * (1 - factor), 0.0722 + 0.9278 * (1 - factor), 0, 0,
          0, 0, 0, 1, 0
        ]
      })
    ];
  },
  cinematic: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.GradientTransparency({
        threshold: 0.8 - (intensity / 200)
      }),
      new fabric.Image.filters.Contrast({
        contrast: intensity / 100
      })
    ];
  },
  dreamy: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.Blur({
        blur: intensity / 100
      }),
      new fabric.Image.filters.Brightness({
        brightness: intensity / 200
      })
    ];
  },
  summer: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.ColorMatrix({
        matrix: [
          1, 0, 0, 0, intensity / 50,
          0, 1, 0, 0, intensity / 100,
          0, 0, 0.8, 0, intensity / 100,
          0, 0, 0, 1, 0
        ]
      })
    ];
  },
  winter: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.ColorMatrix({
        matrix: [
          0.8, 0, 0, 0, 0,
          0, 0.9, 0, 0, 0,
          0, 0, 1.2, 0, intensity / 50,
          0, 0, 0, 1, 0
        ]
      })
    ];
  },
  polaroid: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.Saturation({
        saturation: -intensity / 200
      }),
      new fabric.Image.filters.Brightness({
        brightness: intensity / 200
      }),
      new fabric.Image.filters.Contrast({
        contrast: intensity / 200
      })
    ];
  },
  neo_noir: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    
    // Calculate grayscale intensity factor (0-1)
    const factor = intensity / 100;
    
    return [
      // Use ColorMatrix for gradual grayscale effect
      new fabric.Image.filters.ColorMatrix({
        matrix: [
          1 - factor * 0.3, factor * 0.3, factor * 0.3, 0, 0,
          factor * 0.3, 1 - factor * 0.3, factor * 0.3, 0, 0,
          factor * 0.3, factor * 0.3, 1 - factor * 0.3, 0, 0,
          0, 0, 0, 1, 0
        ]
      }),
      new fabric.Image.filters.Contrast({
        contrast: intensity / 50
      }),
      new fabric.Image.filters.Brightness({
        brightness: -intensity / 150
      })
    ];
  },
  cyberpunk: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.ColorMatrix({
        matrix: [
          1, 0, 0, 0, intensity / 50,
          0, 0.8, 0.2, 0, -intensity / 100,
          0, 0.2, 0.8, 0, intensity / 50,
          0, 0, 0, 1, 0
        ]
      }),
      new fabric.Image.filters.Contrast({
        contrast: intensity / 100
      })
    ];
  },
  pastel: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.Saturation({
        saturation: -intensity / 200
      }),
      new fabric.Image.filters.Brightness({
        brightness: intensity / 150
      })
    ];
  },
  hdr: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.Contrast({
        contrast: intensity / 50
      }),
      new fabric.Image.filters.Saturation({
        saturation: intensity / 100
      })
    ];
  },
  tilt_shift: (intensity: number) => {
    // If intensity is 0, return empty array (no filter)
    if (intensity === 0) return [];
    return [
      new fabric.Image.filters.Blur({
        blur: intensity / 150
      }),
      new fabric.Image.filters.Contrast({
        contrast: intensity / 150
      })
    ];
  }
};

// Apply a specific filter with intensity to a fabric.js image object
export const applyFilter = (
  imageObject: fabric.Image | null,
  filterName: string,
  intensity: number
): void => {
  if (!imageObject) return;
  
  // If selecting 'none' or intensity is 0, just clear the filter
  if (filterName === 'none' || intensity === 0) {
    // Don't remove all filters, as there might be basic adjustments applied
    // Just ensure no preset filter is applied
    const preservedFilters = imageObject.filters?.filter(filter => {
      // Identify and preserve basic adjustment filters by their type
      return ['Brightness', 'Contrast', 'Saturation', 'Gamma', 'Convolute'].includes(filter.type || '');
    }) || [];
    
    imageObject.filters = preservedFilters;
    imageObject.applyFilters();
    return;
  }
  
  // Get the filter preset function
  const filterPreset = filterPresets[filterName as keyof typeof filterPresets];
  
  // If the filter preset exists, apply it
  if (filterPreset) {
    // Keep only the basic adjustment filters
    const preservedFilters = imageObject.filters?.filter(filter => {
      return ['Brightness', 'Contrast', 'Saturation', 'Gamma', 'Convolute'].includes(filter.type || '');
    }) || [];
    
    // Get new filters from the preset
    const newFilters = filterPreset(intensity);
    
    // Combine preserved filters with new filters
    imageObject.filters = [...preservedFilters, ...newFilters];
    imageObject.applyFilters();
  }
};
