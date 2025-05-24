import { fabric } from 'fabric';

// Map overlay IDs to their image URLs
const overlayURLMap: Record<string, string> = {
  'light_leak': '/textures/light-leak.png',
  'grain': '/textures/grain.png',
  'vignette': '/textures/vignette.jpg',
  'rain': '/textures/rain.jpg',
  'bokeh': '/textures/bokeh.jpg',
  'hearts': '/textures/hearts.jpeg',
  'stars': '/textures/stars.jpg',
  'golden': '/textures/golden.jpg',
  'metal': '/textures/metal.jpg',
  'paper': '/textures/paper.jpg',
  'wood': '/textures/wood.jpg',
};

// Function to apply an overlay to an image
export const applyOverlay = (
  canvas: fabric.Canvas,
  overlayId: string,
  opacity: number,
  blendMode: string
): Promise<void> => {
  // If no overlay is selected, remove any existing overlay
  if (overlayId === 'none') {
    removeOverlay(canvas);
    return Promise.resolve();
  }

  // Get the overlay URL based on the ID
  const overlayUrl = overlayURLMap[overlayId] || '';
  if (!overlayUrl) {
    console.error(`Invalid overlay ID: ${overlayId}`);
    return Promise.resolve();
  }
  
  // ALWAYS force-remove existing overlays first to prevent stacking
  removeOverlay(canvas);
  
  return new Promise((resolve, reject) => {
    // Load the overlay image
    fabric.Image.fromURL(overlayUrl, (overlayImg) => {
      try {
        // Find the main image
        const mainImage = canvas.getObjects().find(obj => 
          obj instanceof fabric.Image && !obj.data?.isOverlay
        ) as fabric.Image;
        
        if (!mainImage) {
          console.error("No main image found on canvas");
          resolve();
          return;
        }
        
        // Get the main image's dimensions and position
        const imgWidth = mainImage.getScaledWidth();
        const imgHeight = mainImage.getScaledHeight();
        const imgLeft = mainImage.left || 0;
        const imgTop = mainImage.top || 0;
        
        // Store overlay metadata directly on the object
        overlayImg.data = { 
          isOverlay: true,
          overlayId: overlayId,
          overlayOpacity: opacity,
          overlayBlendMode: blendMode
        };
        
        // Set overlay properties
        overlayImg.set({
          left: imgLeft,
          top: imgTop,
          angle: mainImage.angle || 0,
          flipX: mainImage.flipX || false,
          flipY: mainImage.flipY || false,
          originX: mainImage.originX || 'center',
          originY: mainImage.originY || 'center',
          opacity: opacity / 100, // Convert 0-100 range to 0-1
          globalCompositeOperation: blendMode,
          selectable: false,
          evented: false
        });
        
        // Scale overlay to match the main image exactly
        overlayImg.scaleX = imgWidth / (overlayImg.width || 1);
        overlayImg.scaleY = imgHeight / (overlayImg.height || 1);
        
        // Add the overlay to the canvas
        canvas.add(overlayImg);
        
        // Make sure the overlay is positioned above the main image but below any text/stickers
        canvas.bringForward(overlayImg, mainImage);
        
        // Force a render
        canvas.renderAll();
        
        console.log(`Applied overlay: ${overlayId} with opacity: ${opacity}, blend mode: ${blendMode}`);
        resolve();
      } catch (error) {
        console.error("Error applying overlay:", error);
        reject(error);
      }
    }, { 
      crossOrigin: 'anonymous',
      // Add error handler
      onerror: (err) => {
        console.error(`Failed to load overlay image ${overlayUrl}:`, err);
        reject(err);
      }
    });
  });
};

// Function to remove all existing overlays from the canvas
export const removeOverlay = (canvas: fabric.Canvas): boolean => {
  if (!canvas) return false;
  
  // Get all overlay objects
  const overlays = canvas.getObjects().filter(obj => obj.data?.isOverlay);
  
  if (overlays.length === 0) return false;
  
  console.log(`Removing ${overlays.length} overlay(s)`);
  
  // Remove each overlay
  overlays.forEach(overlay => {
    try {
      canvas.remove(overlay);
    } catch (error) {
      console.error("Error removing overlay:", error);
    }
  });
  
  // Force a render to ensure removal is visible
  canvas.renderAll();
  
  return overlays.length > 0;
};

// Function to update overlay properties (opacity/blend mode)
export const updateOverlayProperties = (
  canvas: fabric.Canvas,
  opacity: number,
  blendMode: string
): void => {
  const overlays = canvas.getObjects().filter(obj => obj.data?.isOverlay);
  
  if (overlays.length === 0) return;
  
  console.log(`Updating overlay properties - opacity: ${opacity}, blend: ${blendMode}`);
  
  overlays.forEach(overlay => {
    try {
      // Update the data property first
      overlay.data = {
        ...overlay.data,
        overlayOpacity: opacity,
        overlayBlendMode: blendMode
      };
      
      // Then update the actual visual properties
      overlay.set({
        opacity: opacity / 100, // Convert percentage to decimal
        globalCompositeOperation: blendMode
      });
    } catch (error) {
      console.error("Error updating overlay properties:", error);
    }
  });
  
  // Force a render to apply changes
  canvas.renderAll();
};

// Function to get current overlay information from canvas
export const getCurrentOverlayInfo = (canvas: fabric.Canvas): {
  overlayId: string;
  opacity: number;
  blendMode: string;
} | null => {
  if (!canvas) return null;
  
  const overlays = canvas.getObjects().filter(obj => obj.data?.isOverlay);
  
  if (overlays.length === 0) return null;
  
  // Get the first overlay (should be only one in practice)
  const overlay = overlays[0];
  
  return {
    overlayId: overlay.data?.overlayId || 'none',
    opacity: overlay.data?.overlayOpacity || 100,
    blendMode: overlay.data?.overlayBlendMode || 'normal'
  };
};