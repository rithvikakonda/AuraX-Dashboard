// components/ImageEffects.tsx


//  Apply RGB shift effect to the image

export const applyRgbShiftEffect = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  intensity: number
): void => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Create a copy of the original data
  const originalData = new Uint8ClampedArray(data);

  // Calculate RGB shift offset based on intensity (0-100)
  const offset = Math.floor((intensity / 100) * 15); // Max offset of 15 pixels

  // Apply RGB channel shifting
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const currentIdx = (y * width + x) * 4;

      // Calculate shifted positions for red/blue channels
      const redX = Math.max(0, Math.min(width - 1, x - offset));
      const blueX = Math.max(0, Math.min(width - 1, x + offset));

      const redIdx = (y * width + redX) * 4;
      const blueIdx = (y * width + blueX) * 4;

      // Apply the channel shifts
      data[currentIdx] = originalData[redIdx]; // Red channel
      // Green stays the same
      data[currentIdx + 2] = originalData[blueIdx + 2]; // Blue channel
    }
  }

  ctx.putImageData(imageData, 0, 0);
};


//  Apply noise effect to the image


export const applyNoiseEffect = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  intensity: number
): void => {
  if (intensity === 0) {
    return;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  const noiseStrength = intensity / 100;

  // Apply realistic colored noise
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;

      // Random color noise per channel
      const rNoise = (Math.random() - 0.5) * 255 * noiseStrength;
      const gNoise = (Math.random() - 0.5) * 255 * noiseStrength;
      const bNoise = (Math.random() - 0.5) * 255 * noiseStrength;

      // Blend with original pixel using alpha blend
      data[index] = Math.min(255, Math.max(0, data[index] + rNoise));
      data[index + 1] = Math.min(255, Math.max(0, data[index + 1] + gNoise));
      data[index + 2] = Math.min(255, Math.max(0, data[index + 2] + bNoise));
      // Leave alpha channel untouched
    }
  }

  // Optional scan lines (subtle and based on intensity)
  if (noiseStrength > 0.3) {
    for (let y = 0; y < height; y += 2) {
      const scanAlpha = 1 - (Math.random() * 0.1 + 0.05) * noiseStrength;
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        data[idx] *= scanAlpha;
        data[idx + 1] *= scanAlpha;
        data[idx + 2] *= scanAlpha;
      }
    }
  }

  // Optional blocky displacement (adds glitchiness only at high intensity)
  if (noiseStrength > 0.7) {
    const displaceCount = Math.floor(noiseStrength * 4);
    const originalData = new Uint8ClampedArray(data);

    for (let i = 0; i < displaceCount; i++) {
      const startY = Math.floor(Math.random() * height);
      const blockHeight = Math.floor(Math.random() * 10) + 3;
      const offset = Math.floor((Math.random() - 0.5) * 20);

      for (let y = startY; y < startY + blockHeight && y < height; y++) {
        for (let x = 0; x < width; x++) {
          const srcX = Math.min(width - 1, Math.max(0, x + offset));
          const from = (y * width + srcX) * 4;
          const to = (y * width + x) * 4;

          data[to] = originalData[from];
          data[to + 1] = originalData[from + 1];
          data[to + 2] = originalData[from + 2];
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};


//     Apply glitch effect to the image
export const applyGlitchEffect = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  intensity: number
): void => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Create a copy of the original data
  const originalData = new Uint8ClampedArray(data);

  // Scale intensity from 0-100 to 0-1
  const glitchIntensity = intensity / 100;

  // Apply random channel shifts
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < glitchIntensity * 0.1) {
      // Randomly offset RGB channels
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Random channel swap
      if (Math.random() < 0.3) {
        data[i] = g;
        data[i + 1] = b;
        data[i + 2] = r;
      }
    }
  }

  // Create horizontal glitch slices
  const sliceCount = Math.floor(glitchIntensity * 20); // Up to 20 slices

  for (let i = 0; i < sliceCount; i++) {
    // Random slice height and position
    const sliceHeight = Math.floor(Math.random() * 20) + 5;
    const sliceY = Math.floor(Math.random() * height);
    const sliceOffset = Math.floor((Math.random() - 0.5) * glitchIntensity * 40);

    // Apply horizontal slice shift
    for (let y = sliceY; y < sliceY + sliceHeight && y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Calculate source x-coordinate with offset, wrapping around
        const sourceX = (x + sliceOffset + width) % width;

        // Calculate pixel indices
        const targetIdx = (y * width + x) * 4;
        const sourceIdx = (y * width + sourceX) * 4;

        // Copy RGB values from source to target
        data[targetIdx] = originalData[sourceIdx];
        data[targetIdx + 1] = originalData[sourceIdx + 1];
        data[targetIdx + 2] = originalData[sourceIdx + 2];
      }
    }
  }

  // Apply random vertical shifts for stronger glitch effect
  if (glitchIntensity > 0.5) {
    const verticalShiftCount = Math.floor(glitchIntensity * 5);

    for (let i = 0; i < verticalShiftCount; i++) {
      const shiftWidth = Math.floor(Math.random() * 50) + 20;
      const shiftX = Math.floor(Math.random() * (width - shiftWidth));
      const shiftOffset = Math.floor((Math.random() - 0.5) * glitchIntensity * 30);

      for (let y = 0; y < height; y++) {
        const sourceY = (y + shiftOffset + height) % height;

        for (let x = shiftX; x < shiftX + shiftWidth && x < width; x++) {
          const targetIdx = (y * width + x) * 4;
          const sourceIdx = (sourceY * width + x) * 4;

          data[targetIdx] = originalData[sourceIdx];
          data[targetIdx + 1] = originalData[sourceIdx + 1];
          data[targetIdx + 2] = originalData[sourceIdx + 2];
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};


// Function to apply the selected effect to an image

export const applyEffect = (
  effectType: string,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  intensity: number
): void => {
  switch (effectType) {
    case 'rgb':
      applyRgbShiftEffect(ctx, canvas, intensity);
      break;
    case 'noise':
      applyNoiseEffect(ctx, canvas, intensity);
      break;
    case 'glitch':
      applyGlitchEffect(ctx, canvas, intensity);
      break;
    case 'none':
    default:
      // No effect to apply
      break;
  }
};