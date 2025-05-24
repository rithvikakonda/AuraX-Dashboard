/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  setImageHeight,
  setImageWidth,
  setTransformWidth,
  setTransformHeight,
  setShowAspects,
  selectText,
  setTextPosition,
  setTextRotation,
  setWidth,
  deleteText,
  duplicateText,
  updateTextContent,
  setIsExporting,
  setIsSaving,
  saveCanvasState,
  undoCanvasState,
  redoCanvasState,
  setBrightness,
  setContrast,
  setSaturation,
  setGamma,
  setConvolute,
  setRotatedAngle,
  FlipImageHorizontal,
  FlipImageVertical,
  setSelectedFilter,
  setFilterIntensity,
  setActiveEffect,
  setGlitchIntensity,
  setNoiseIntensity,
  setRgbShiftIntensity,
  setSelectedOverlay,
  setOverlayOpacity,
  setOverlayBlendMode,
  setBrushHardness,
  setBrushSize,
  setBrushColor,
  setBrushOpacity,
  updateStickerPosition,
  updateStickerRotation,
  updateStickerScale,
  deleteSticker,
  setActiveFeature,
  TextPropertiesState,
} from "@/redux/features/studioSlice";
import { fabric } from "fabric";
import { applyEffect } from "./left_components/EffectsManager";
import { applyFilter } from "./left_components/FilterManager";
import {
  applyOverlay,
  removeOverlay,
  updateOverlayProperties,
  getCurrentOverlayInfo,
} from "./left_components/OverlayManager";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trash2 } from 'lucide-react';

// Define standard convolution kernels
const convolutionKernels = {
  normal: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  blur: [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9],
  emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
  edgeDetect: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
  edgeEnhance: [0, 0, 0, -1, 1, 0, 0, 0, 0],
  gaussianBlur: [
    1 / 16,
    2 / 16,
    1 / 16,
    2 / 16,
    4 / 16,
    2 / 16,
    1 / 16,
    2 / 16,
    1 / 16,
  ],
};

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const FabricCanvas = () => {
  const router = useRouter();
  const {
    imageUrl,
    transform,
    basicAdjustments,
    activeFeature,
    texts,
    selectedTextId,
    brush,
    isExporting,
    exportFormat,
    isSaving,
    imageId,
    versionId,
    width,
    height,
    selectedTemplate,
    stickers
  } = useAppSelector((state) => state.studio);
  const { selectedFilter, filterIntensity } = useAppSelector(
    (state) => state.studio.filters
  );

  const overlayAppliedRef = useRef<boolean>(false);
  const { selectedOverlay, overlayOpacity, overlayBlendMode } = useAppSelector(
    (state) => state.studio.overlays
  );
  // Extract transform state outside of useEffect
  const currentTransform = useAppSelector((state) => state.studio.transform);
  // Add effects state from Redux
  const { activeEffect, glitchIntensity, noiseIntensity, rgbShiftIntensity } =
    useAppSelector(
      (state) =>
        state.studio.effects || {
          activeEffect: "none",
          glitchIntensity: 0,
          noiseIntensity: 0,
          rgbShiftIntensity: 0,
        }
    );
  const dispatch = useAppDispatch();
  const canvasDimensions = {
    width: 650,
    height: 650,
  };

  // Calculate RGBA value from hex and opacity
  const getRgbaColor = (text: TextPropertiesState, colorType: string) => {
    const hex =
      colorType === "font"
        ? text.fontColor.replace("#", "")
        : text.backgroundColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const opacity =
      colorType === "font"
        ? text.fontColorOpacity
        : text.backgroundColorOpacity;
    if (colorType === "background" && text.backgroundColor === "transparent") {
      return "rgba(255, 255, 255, 0)";
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  // Reference to the original image
  const originalImageRef = useRef<fabric.Image | null>(null);
  //  Add a reference to the currently processed image (after effects)
  const processedImageRef = useRef<HTMLCanvasElement | null>(null);
  // Reference to image state before any effect is applied
  const noEffectCanvasRef = useRef<string | null>(null);
  // State to track if component is mounted in client-side
  const [isClient, setIsClient] = useState(false);
  // Add state to track image loading status
  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error" | "idle"
  >("idle");
  // State to track if crop is active
  const [cropActive, setCropActive] = useState(false);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Reference to crop rect
  const cropRectRef = useRef<fabric.Rect | null>(null);
  // Reference to track if image is cropped
  const imageIsCroppedRef = useRef<boolean>(false);
  // Keep original image data
  const originalImageDataRef = useRef<{
    element: HTMLImageElement | null;
    width: number;
    height: number;
  }>({
    element: null,
    width: 0,
    height: 0,
  });
  // Track previous effect to know when effect changes
  const previousEffectRef = useRef<string>("none");

  // Add refs for snap lines
  const horizontalSnapLineRef = useRef<fabric.Line | null>(null);
  const verticalSnapLineRef = useRef<fabric.Line | null>(null);
  const fabricStickersRef = useRef<Map<string, fabric.Object>>(new Map());

  // Threshold for snapping in pixels
  const snapThreshold = 10;

  // Maximum canvas dimensions
  const maxWidth = 650;
  const maxHeight = 650;

  // Add a reference to the brush
  const brushRef = useRef<fabric.BaseBrush | null>(null);

  // Get history from Redux state
  const { canvasHistory, historyIndex } = useAppSelector(
    (state) => state.studio
  );

  // Flag to prevent adding restored states back to history
  const isRestoringFromHistory = useRef<boolean>(false);

  // Function to save current canvas state to history
  const saveCurrentCanvasState = useCallback(() => {
    if (isRestoringFromHistory.current || !fabricCanvasRef.current) return;
    // Ensure any pending canvas sync is complete
    syncOverlayStateWithCanvas();
    // Convert canvas to JSON
    const jsonData = fabricCanvasRef.current.toJSON([
      "id",
      "selectable",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "textAlign",
      "charSpacing",
      "lineHeight",
      "stroke",
      "strokeWidth",
      "backgroundColor",
      "textBackgroundColor",
      "fill",
      "fillRule",
      "opacity",
      "angle",
      "flipX",
      "flipY",
      "width",
      "height",
      "top",
      "left",
      "scaleX",
      "scaleY",
      "strokeDashArray",
      "visible",
      "path",
      "strokeLineCap",
      "strokeLineJoin",
      "strokeMiterLimit",
      "strokeDashOffset",
      "strokeUniform",
      "data", // CRITICAL: Include data property to store overlay information
      "globalCompositeOperation", // CRITICAL: Include blending mode
      "stickerId",
    ]);

    // Save to Redux
    dispatch(saveCanvasState({ canvasData: jsonData }));
  }, [dispatch]);

  // Add this useEffect to track transform changes and save state
  useEffect(() => {
    if (
      fabricCanvasRef.current &&
      imageStatus === "success" &&
      !isRestoringFromHistory.current
    ) {
      console.log("Transformation changed, saving canvas state");
      // Add a slight delay to ensure the canvas has updated
      setTimeout(saveCurrentCanvasState, 100);
    }
  }, [
    transform.rotatedAngle,
    transform.flippedX,
    transform.flippedY,
    saveCurrentCanvasState,
  ]);

  // Add this useEffect for keyboard shortcuts

  useEffect(() => {
    // Handler for keyboard shortcuts
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Skip if focused on an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Undo: Ctrl+Z (Windows) or Command+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();

        // Check if undo is available
        if (historyIndex > 0) {
          console.log("Keyboard shortcut: Undo");
          dispatch(undoCanvasState());
        } else {
          console.log("Cannot undo: Already at oldest state");
        }
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z (Windows) or Command+Shift+Z (Mac)
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();

        // Check if redo is available
        if (historyIndex < canvasHistory.length - 1) {
          console.log("Keyboard shortcut: Redo");
          dispatch(redoCanvasState());
        } else {
          console.log("Cannot redo: Already at newest state");
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyboardShortcuts);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [dispatch, historyIndex, canvasHistory]);

  useEffect(() => {
    if (
      fabricCanvasRef.current &&
      imageStatus === "success" &&
      !isRestoringFromHistory.current
    ) {
      // Delay allows the canvas to fully render the changes first
      setTimeout(saveCurrentCanvasState, 300);
    }
  }, [texts.length, saveCurrentCanvasState, imageStatus]); // Only save when the number of texts changes

  useEffect(() => {
    if (
      fabricCanvasRef.current &&
      selectedTextId !== null &&
      texts.length > 0 &&
      imageStatus === "success" &&
      !isRestoringFromHistory.current
    ) {
      const selectedText = texts.find((text) => text.id === selectedTextId);
      if (selectedText) {
        // Debounced save for property changes to avoid too many history entries
        const timeoutId = setTimeout(saveCurrentCanvasState, 500);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    selectedTextId,
    texts,
    imageStatus,
    saveCurrentCanvasState,
    // We intentionally don't include specific text properties to avoid
    // saving too many intermediate states when properties are being adjusted
  ]);

  // Monitor history index and restore canvas when it changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndex < 0 || canvasHistory.length === 0) return;

    const stateToRestore = canvasHistory[historyIndex];
    if (!stateToRestore) return;

    // Set flag to prevent saving the restored state
    isRestoringFromHistory.current = true;

    // Clear and restore canvas from the canvasData property
    canvas.clear();
    canvas.loadFromJSON(stateToRestore.canvasData, () => {
      canvas.renderAll();
      console.log("Canvas restored from history index:", historyIndex);
      const canvasObjects = canvas.getObjects();
      fabricStickersRef.current.clear(); // Clear existing references
      canvasObjects.forEach(obj => {
        if (obj.stickerId) {
          // Reconnect object reference to fabricStickersRef
          fabricStickersRef.current.set(obj.stickerId, obj);
        }
      });

      // Restore metadata to Redux state
      if (stateToRestore.metadata) {
        // Restore basic adjustments
        if (stateToRestore.metadata.basicAdjustments) {
          const adjustments = stateToRestore.metadata.basicAdjustments;
          dispatch(setBrightness(adjustments.brightness));
          dispatch(setContrast(adjustments.contrast));
          dispatch(setSaturation(adjustments.saturation));
          dispatch(setGamma(adjustments.gamma));
          dispatch(setConvolute(adjustments.convolute));
        }

        // Restore transform
        if (stateToRestore.metadata.transform) {
          const transform = stateToRestore.metadata.transform;
          dispatch(setTransformWidth(transform.width));
          dispatch(setTransformHeight(transform.height));
          dispatch(setRotatedAngle(transform.rotatedAngle));
          // Handle flips if they changed
          if (transform.flippedX !== undefined) {
            if (transform.flippedX !== currentTransform.flippedX) {
              dispatch(FlipImageHorizontal());
            }
          }
          if (transform.flippedY !== undefined) {
            if (transform.flippedY !== currentTransform.flippedY) {
              dispatch(FlipImageVertical());
            }
          }
        }

        // Restore filters
        if (stateToRestore.metadata.filters) {
          const filters = stateToRestore.metadata.filters;
          dispatch(setSelectedFilter(filters.selectedFilter));
          dispatch(setFilterIntensity(filters.filterIntensity));
        }

        // Restore effects
        if (stateToRestore.metadata.effects) {
          const effects = stateToRestore.metadata.effects;
          dispatch(setActiveEffect(effects.activeEffect));
          dispatch(setGlitchIntensity(effects.glitchIntensity));
          dispatch(setNoiseIntensity(effects.noiseIntensity));
          dispatch(setRgbShiftIntensity(effects.rgbShiftIntensity));
        }

        // Restore overlays
        if (stateToRestore.metadata.overlays) {
          const overlays = stateToRestore.metadata.overlays;
          dispatch(setSelectedOverlay(overlays.selectedOverlay));
          dispatch(setOverlayOpacity(overlays.overlayOpacity));
          dispatch(setOverlayBlendMode(overlays.overlayBlendMode));
          // Check if the overlay needs to be reapplied
          const existingOverlay = canvas.getObjects().find(obj => obj.data?.isOverlay);

          if (overlays.selectedOverlay !== 'none' && !existingOverlay) {
            console.log("Manually reapplying overlay during history restoration");

            // Remove any potential overlay remnants first
            removeOverlay(canvas);

            // Then apply the overlay from metadata
            setTimeout(() => {
              applyOverlay(
                canvas,
                overlays.selectedOverlay,
                overlays.overlayOpacity,
                overlays.overlayBlendMode
              ).then(() => {
                overlayAppliedRef.current = true;
                canvas.renderAll();
              });
            }, 50);
          } else if (existingOverlay) {
            // If overlay exists, ensure the reference is correct
            overlayAppliedRef.current = true;

            // And force-update its properties to match metadata
            updateOverlayProperties(
              canvas,
              overlays.overlayOpacity,
              overlays.overlayBlendMode
            );
          } else {
            overlayAppliedRef.current = false;
          }
        }
        if (stateToRestore.metadata.texts) {
          // Replace the entire texts array
          dispatch({
            type: "studio/replaceTexts",
            payload: stateToRestore.metadata.texts,
          });

          // Restore selected text ID
          dispatch(selectText(stateToRestore.metadata.selectedTextId));
        }
        if (stateToRestore.metadata.brush) {
          const brushSettings = stateToRestore.metadata.brush;
          dispatch(setBrushHardness(brushSettings.hardness));
          dispatch(setBrushSize(brushSettings.size));
          dispatch(setBrushColor(brushSettings.color));
          dispatch(setBrushOpacity(brushSettings.opacity));
        }
        if (stateToRestore.metadata.stickers) {
          // Update Redux state with the stickers from history
          dispatch({
            type: "studio/replaceStickers",
            payload: stateToRestore.metadata.stickers
          });
        }
      }

      // Reset flag after restoration is complete
      setTimeout(() => {
        isRestoringFromHistory.current = false;
      }, 100);
    });
  }, [historyIndex, canvasHistory, dispatch]);

  // Save state when canvas objects are modified
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleObjectModified = () => {
      console.log("Object modified, saving canvas state");
      saveCurrentCanvasState();
    };

    const handlePathCreated = (e: any) => {
      const path = e.path;
      console.log("New path created:", path);

      // Path is already added to canvas, we can customize it further if needed
      path.selectable = false; // Make paths non-selectable after drawing

      // After a path is created, let's save the canvas state
      if (noEffectCanvasRef.current) {
        noEffectCanvasRef.current = canvas.toDataURL();
      }

      console.log("Saving brush stroke to history");
      setTimeout(saveCurrentCanvasState, 100);
    };

    canvas.on("object:modified", handleObjectModified);
    canvas.on("path:created", handlePathCreated);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("path:created", handlePathCreated);
    };
  }, [saveCurrentCanvasState]);

  // Save initial state when image loads
  useEffect(() => {
    if (imageStatus === "success" && fabricCanvasRef.current) {
      console.log("Image loaded successfully, saving initial canvas state");
      setTimeout(saveCurrentCanvasState, 300);
    }
  }, [imageStatus, saveCurrentCanvasState]);

  useEffect(() => {
    if (
      fabricCanvasRef.current &&
      imageStatus === "success" &&
      !isRestoringFromHistory.current
    ) {
      // Use a debounced save with adequate delay
      const timeoutId = setTimeout(saveCurrentCanvasState, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [
    basicAdjustments,
    selectedFilter,
    filterIntensity,
    activeEffect,
    glitchIntensity, // Add for glitch effect intensity
    noiseIntensity, // Add for noise effect intensity
    rgbShiftIntensity, // Add for RGB shift effect intensity
    saveCurrentCanvasState,
  ]);
  // Initialize Fabric.js canvas on component mount
  useEffect(() => {
    setIsClient(true);

    if (!canvasContainerRef.current) return;

    // Clean up any existing canvas first
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    // Create a container div to handle the canvas creation
    const container = canvasContainerRef.current;
    container.innerHTML = ""; // Clear any existing content

    // Create a new canvas element
    const canvasEl = document.createElement("canvas");
    canvasEl.width = canvasDimensions.width;
    canvasEl.height = canvasDimensions.height;
    canvasEl.className = "border border-border rounded-md shadow-sm";
    container.appendChild(canvasEl);

    // Initialize Fabric canvas immediately
    try {
      const fabricCanvas = new fabric.Canvas(canvasEl, {
        selection: true,
        preserveObjectStacking: true,
      });
      fabricCanvasRef.current = fabricCanvas;
      console.log("Fabric canvas initialized successfully");

      // Draw a background to confirm canvas is working
      fabricCanvas.backgroundColor = "#e0e0e0";
      fabricCanvas.renderAll();
      fabricCanvas.on('object:modified', (e) => {
        if (e.target && e.target.stickerId) {
          const stickerId = e.target.stickerId;
          // obj.bringToFront();
          const obj = e.target;
          if (obj.left !== undefined && obj.top !== undefined) {
            dispatch(updateStickerPosition({
              id: stickerId,
              x: obj.left,
              y: obj.top
            }));
          }
          if (obj.scaleX !== undefined) {
            // Use updateStickerScale instead of updateStickerSize
            dispatch(updateStickerScale({
              id: stickerId,
              scale: obj.scaleX  // Assuming uniform scaling (scaleX = scaleY)
            }));
          }
          if (obj.angle !== undefined) {
            dispatch(updateStickerRotation({
              id: stickerId,
              rotation: obj.angle
            }));
          }
        }
      });

      fabricCanvas.on('selection:created', (e) => {
        if (e.selected && e.selected[0]) {
          const selectedObject = e.selected[0];
          if (selectedObject.stickerId) {
            setSelectedStickerId(selectedObject.stickerId);
            selectedObject.bringToFront();
          } else {
            setSelectedStickerId(null);
          }
        } else {
          setSelectedStickerId(null);
        }
      });

      fabricCanvas.on('selection:updated', (e) => {
        if (e.selected && e.selected[0] && e.selected[0].stickerId) {
          setSelectedStickerId(e.selected[0].stickerId);
        } else {
          setSelectedStickerId(null);
        }
      });

      fabricCanvas.on('selection:cleared', () => {
        setSelectedStickerId(null);
      });
      document.addEventListener('keydown', handleKeyDown);
    } catch (error) {
      console.error("Error initializing Fabric canvas:", error);
    }
    return () => {
      // document.removeEventListener('keydown', handleKeyDown);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [isClient, dispatch]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const canvas = fabricCanvasRef.current;
      if (canvas?.getActiveObject()?.stickerId) {
        const stickerId = canvas.getActiveObject()?.stickerId;
        dispatch(deleteSticker(stickerId));
        canvas.remove(canvas.getActiveObject()!);
        canvas.renderAll();
        setSelectedStickerId(null);
      }
    }
  };

  const handleDeleteSticker = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedStickerId) return;

    const stickerToDelete = fabricStickersRef.current.get(selectedStickerId);
    if (stickerToDelete) {
      canvas.remove(stickerToDelete);
      dispatch(deleteSticker(selectedStickerId));
      canvas.renderAll();
      setSelectedStickerId(null);
      saveCurrentCanvasState();
    }
  };


  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    fabricStickersRef.current.forEach((obj) => {
      canvas.remove(obj);
    });
    fabricStickersRef.current.clear();
    stickers.forEach(sticker => {
      fabric.Image.fromURL(
        sticker.imageUrl,
        (img) => {
          img.set({
            left: sticker.x,
            top: sticker.y,
            selectable: true,
            hasControls: true,
            angle: sticker.rotation,
            scaleX: sticker.scale,
            scaleY: sticker.scale,
            originX: 'center',
            originY: 'center',
            cornerSize: 10, // Set corner size to match text
            borderColor: "rgba(255,255,255,0.8)", // White border
            cornerColor: "white", // White corners
            cornerStrokeColor: "black", // Black stroke for corners
            transparentCorners: false,
            cornerStyle: "circle", // Circle corners

            stickerId: sticker.id
          });

          img.setControlVisible("ml", false);
          img.setControlVisible("mr", false);
          img.setControlVisible("mt", false); // Middle Top
          img.setControlVisible("mb", false); // Middle Bottom
          img.setControlVisible("tr", true); // Top Right
          img.setControlVisible("tl", true); // Top Left
          img.setControlVisible("br", true); // Bottom Right
          img.setControlVisible("bl", true); // Bottom Left

          // Store reference
          fabricStickersRef.current.set(sticker.id, img);

          // Add to canvas and bring to front
          canvas.add(img);
          img.bringToFront();
          // fabricStickersRef.current.set(sticker.id, img);
          // canvas.add(img);
          canvas.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );
    });
    saveCurrentCanvasState();
  }, [stickers]);

  // Load image onto Fabric canvas when imageUrl changes
  useEffect(() => {
    // console.log("Image URL changed:", imageUrl);
    if (!imageUrl || !isClient) {
      return;
    }

    // Reset states when new image is loaded
    imageIsCroppedRef.current = false;
    processedImageRef.current = null;
    noEffectCanvasRef.current = null;
    previousEffectRef.current = "none";

    // If the canvas isn't ready yet, try initializing it first
    if (!fabricCanvasRef.current && canvasContainerRef.current) {
      console.log("Canvas not initialized yet");
      return;
    }

    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) {
      console.error("Failed to initialize Fabric canvas");
      return;
    }

    // Set loading state
    setImageStatus("loading");
    console.log("Loading image from URL:", imageUrl);

    // Clear existing canvas content
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#e0e0e0";
    fabricCanvas.renderAll();

    // Create a standard HTML image first to test loading
    const testImg = new Image();
    testImg.crossOrigin = "anonymous";
    testImg.onload = () => {
      console.log(
        "Test image loaded successfully, dimensions:",
        testImg.width,
        "x",
        testImg.height
      );

      // Store original image dimensions
      originalImageDataRef.current = {
        element: testImg,
        width: testImg.width,
        height: testImg.height,
      };

      // Now try loading with Fabric
      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          if (!img) {
            console.error("Failed to create Fabric image object");
            setImageStatus("error");
            return;
          }
          console.log("Fabric image created:", img);

          // Store the original image reference
          originalImageRef.current = img;

          // Store original image dimensions in Redux
          const imgWidth = img.width ?? 0;
          const imgHeight = img.height ?? 0;

          // Calculate dimensions to maintain aspect ratio
          let newWidth = imgWidth;
          let newHeight = imgHeight;

          if (imgWidth && imgHeight) {
            const imgRatio = imgWidth / imgHeight;

            // Scale down if needed while maintaining aspect ratio
            if (newWidth > maxWidth) {
              newWidth = maxWidth;
              newHeight = newWidth / imgRatio;
            }

            if (newHeight > maxHeight) {
              newHeight = maxHeight;
              newWidth = newHeight * imgRatio;
            }
          } else {
            // Use default dimensions if image dimensions are invalid
            console.warn("Invalid image dimensions, using defaults");
            newWidth = canvasDimensions.width;
            newHeight = canvasDimensions.height;
          }

          // Resize the canvas to match the image dimensions
          console.log("Resizing canvas to:", newWidth, "x", newHeight);
          fabricCanvas.setWidth(canvasDimensions.width);
          fabricCanvas.setHeight(canvasDimensions.height);
          dispatch(setImageWidth(Math.round(newWidth)));
          dispatch(setImageHeight(Math.round(newHeight)));
          dispatch(setTransformWidth(Math.round(newWidth)));
          dispatch(setTransformHeight(Math.round(newHeight)));

          try {
            // Ensure the image is properly sized
            img.scaleToWidth(newWidth);
            img.selectable = false; // Make the base image not selectable

            // Add initial filters (they'll be updated right after)
            applyFiltersToImage(img);

            // Add the image to the canvas
            fabricCanvas.add(img);
            fabricCanvas.centerObject(img);
            fabricCanvas.renderAll();

            // Store the initial canvas state without effects
            noEffectCanvasRef.current = fabricCanvas.toDataURL();

            console.log("Image added to canvas successfully");
            setImageStatus("success");
          } catch (error) {
            console.error("Error adding image to canvas:", error);
            setImageStatus("error");
          }
        },
        {
          crossOrigin: "anonymous",
          // Add error handling for Fabric image creation
          onerror: () => {
            console.error("Error loading image in Fabric");
            setImageStatus("error");
          },
        }
      );
    };

    testImg.onerror = (e) => {
      console.error("Error loading test image:", e);
      setImageStatus("error");
    };

    testImg.src = imageUrl;
  }, [imageUrl, dispatch, isClient]);

  // Apply filters when basic adjustments change
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Find the image object on the canvas
    const objects = canvas.getObjects();
    const imageObject = objects.find((obj) => obj instanceof fabric.Image);

    if (imageObject && imageObject instanceof fabric.Image) {
      applyFiltersToImage(imageObject);
      canvas.renderAll();

      // Update the no-effect state if there's no active effect
      if (activeEffect === "none") {
        noEffectCanvasRef.current = canvas.toDataURL();
      }
    }
  }, [basicAdjustments]);

  // Apply rotation and flip transformations when transform state changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Find the image object on the canvas
    const objects = canvas.getObjects();
    const imageObject = objects.find((obj) => obj instanceof fabric.Image);

    if (imageObject) {
      // Apply rotation
      imageObject.set({
        angle: transform.rotatedAngle,
        flipX: transform.flippedX,
        flipY: transform.flippedY,
      });

      // Ensure the image stays centered after transformation
      canvas.centerObject(imageObject);
      canvas.renderAll();

      // Update the no-effect state if there's no active effect
      if (activeEffect === "none") {
        noEffectCanvasRef.current = canvas.toDataURL();
      }
    }
  }, [transform.rotatedAngle, transform.flippedX, transform.flippedY]);

  // Helper function to get convolute kernel based on intensity
  const getConvoluteKernel = (intensity: number) => {
    // Map the -100 to 100 range to different kernels
    if (intensity === 0) {
      return convolutionKernels.normal;
    }

    // For negative values (-100 to -1), gradually blend between blur and normal
    if (intensity < 0) {
      const normalizedIntensity = Math.abs(intensity) / 100;
      return convolutionKernels.blur.map((blurValue, index) => {
        const normalValue = convolutionKernels.normal[index];
        return (
          blurValue * normalizedIntensity +
          normalValue * (1 - normalizedIntensity)
        );
      });
    }

    // For positive values (1 to 100), gradually blend between sharpen and normal
    const normalizedIntensity = intensity / 100;
    return convolutionKernels.sharpen.map((sharpenValue, index) => {
      const normalValue = convolutionKernels.normal[index];
      return (
        sharpenValue * normalizedIntensity +
        normalValue * (1 - normalizedIntensity)
      );
    });
  };

  // Modify your applyFiltersToImage function:
  const applyFiltersToImage = (imageObject: fabric.Image) => {
    if (!imageObject) return;
    imageObject.filters = [];

    // Apply basic adjustments first
    if (basicAdjustments.brightness !== 0) {
      imageObject.filters.push(
        new fabric.Image.filters.Brightness({
          brightness: basicAdjustments.brightness / 100,
        })
      );
    }
    if (basicAdjustments.contrast !== 0) {
      imageObject.filters.push(
        new fabric.Image.filters.Contrast({
          contrast: basicAdjustments.contrast / 100,
        })
      );
    }
    if (basicAdjustments.saturation !== 0) {
      imageObject.filters.push(
        new fabric.Image.filters.Saturation({
          saturation: basicAdjustments.saturation / 100,
        })
      );
    }
    if (basicAdjustments.gamma !== 0) {
      const gammaValue = 1 + (basicAdjustments.gamma / 100) * 1.8;
      imageObject.filters.push(
        new fabric.Image.filters.Gamma({
          gamma: [gammaValue, gammaValue, gammaValue],
        })
      );
    }
    if (basicAdjustments.convolute !== 0) {
      const matrix = getConvoluteKernel(basicAdjustments.convolute);
      imageObject.filters.push(
        new fabric.Image.filters.Convolute({
          matrix: matrix,
        })
      );
    }

    // Then apply the selected filter if it's not 'none'
    if (selectedFilter !== "none") {
      // Apply the filter using our FilterManager
      applyFilter(imageObject, selectedFilter, filterIntensity);
    }

    imageObject.applyFilters();
  };

  // Add a new useEffect to handle filter changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const imageObject = objects.find((obj) => obj instanceof fabric.Image);

    if (imageObject && imageObject instanceof fabric.Image) {
      // We need to reapply all filters when filter selection or intensity changes
      applyFiltersToImage(imageObject);
      canvas.renderAll();

      if (activeEffect === "none") {
        noEffectCanvasRef.current = canvas.toDataURL();
      }
    }
  }, [selectedFilter, filterIntensity]);

  // Function to apply the current effect to the image
  const applyEffectToImage = (): void => {
    if (!fabricCanvasRef.current || imageStatus !== "success") {
      return;
    }

    const canvas = fabricCanvasRef.current;
    const currentEffect = activeEffect;
    const prevEffect = previousEffectRef.current;

    // Update reference to current effect for next time
    previousEffectRef.current = currentEffect;

    console.log(`Applying effect: ${currentEffect} (prev: ${prevEffect})`);

    // If we're removing an effect (switching to 'none'), restore from the no-effect state
    if (currentEffect === "none" && noEffectCanvasRef.current) {
      const img = new Image();
      img.onload = () => {
        canvas.clear();
        fabric.Image.fromURL(noEffectCanvasRef.current!, (restoredImg) => {
          restoredImg.selectable = false;

          canvas.add(restoredImg);
          canvas.centerObject(restoredImg);
          canvas.renderAll();

          // Clear the processed image reference
          processedImageRef.current = null;
          console.log("Removed effect and restored non-effect state");
        });
      };
      img.src = noEffectCanvasRef.current;
      return;
    }

    // Always use the clean state (no effects) as our starting point
    // This ensures we don't build up effects on top of each other
    if (noEffectCanvasRef.current) {
      const sourceImage = noEffectCanvasRef.current;

      // Create a temporary canvas to apply the effect to
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width as number;
      tempCanvas.height = canvas.height as number;
      const ctx = tempCanvas.getContext("2d");

      if (!ctx) {
        console.error("Could not get 2D context for temporary canvas");
        return;
      }

      // Load the source image
      const img = new Image();
      img.onload = () => {
        // Draw the source image to the temp canvas (clean state)
        ctx.drawImage(img, 0, 0);

        // Get the intensity based on the active effect
        const intensity =
          currentEffect === "glitch"
            ? glitchIntensity
            : currentEffect === "noise"
              ? noiseIntensity
              : currentEffect === "rgb"
                ? rgbShiftIntensity
                : 0;

        console.log(
          `Using intensity: ${intensity} for effect: ${currentEffect}`
        );

        // Apply the selected effect directly from Redux state values
        if (currentEffect !== "none") {
          applyEffect(currentEffect, ctx, tempCanvas, intensity);
        }

        // Save the processed canvas for future operations
        processedImageRef.current = tempCanvas;

        // Update the fabric image with the processed image
        fabric.Image.fromURL(tempCanvas.toDataURL(), (newImg) => {
          canvas.clear();

          newImg.scaleToWidth(canvas.width as number);
          newImg.selectable = false;

          // Apply current transformations
          newImg.set({
            angle: transform.rotatedAngle,
            flipX: transform.flippedX,
            flipY: transform.flippedY,
          });

          canvas.add(newImg);
          canvas.centerObject(newImg);
          canvas.renderAll();

          console.log(
            `Applied ${currentEffect} effect with intensity ${intensity}`
          );
        });
      };

      img.src = sourceImage;
    }
  };

  // Apply effects when activeEffect or intensity changes
  useEffect(() => {
    if (imageStatus === "success") {
      applyEffectToImage();
      // Wait a bit then restore overlay
      if (selectedOverlay !== 'none') {
        setTimeout(() => {
          const canvas = fabricCanvasRef.current;
          if (canvas) {
            applyOverlay(canvas, selectedOverlay, overlayOpacity, overlayBlendMode);
          }
        }, 200);
      }
    }
  }, [
    activeEffect,
    glitchIntensity,
    noiseIntensity,
    rgbShiftIntensity,
    imageStatus,
  ]);

  // Handle crop activation/deactivation
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isClient) return;

    if (activeFeature !== "text") {
      selectText(null);
    }

    if (activeFeature === "transform") {
      setCropActive(true);

      // Clear any existing crop rect
      if (cropRectRef.current) {
        canvas.remove(cropRectRef.current);
      }

      // Calculate initial crop dimensions
      let cropWidth = transform.width || canvasDimensions.width * 0.8;
      let cropHeight = transform.height || canvasDimensions.height * 0.8;

      // If aspect ratio is selected, adjust dimensions
      if (transform.selectedAspect) {
        const aspectRatio =
          transform.selectedAspect.width / transform.selectedAspect.height;
        if (cropWidth / cropHeight > aspectRatio) {
          cropWidth = cropHeight * aspectRatio;
        } else {
          cropHeight = cropWidth / aspectRatio;
        }
      }

      // Create the crop rectangle
      const cropRect = new fabric.Rect({
        left: (canvasDimensions.width - cropWidth) / 2,
        top: (canvasDimensions.height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
        fill: "rgba(0,0,0,0)",
        stroke: "rgba(255,255,255,0.8)",
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        transparentCorners: false,
        cornerColor: "white",
        cornerStrokeColor: "black",
        borderColor: "rgba(255,255,255,0.8)",
        cornerSize: 15,
        padding: 0,
        cornerStyle: "circle",
        lockRotation: true,
        hasRotatingPoint: false,
      });

      cropRectRef.current = cropRect;
      canvas.add(cropRect);
      canvas.setActiveObject(cropRect);
      canvas.renderAll();

      // Update transform dimensions when crop rectangle changes
      cropRect.on("modified", () => {
        if (cropRect.width && cropRect.height) {
          dispatch(setTransformWidth(Math.round(cropRect.width)));
          dispatch(setTransformHeight(Math.round(cropRect.height)));
        }
      });
    } else {
      setCropActive(false);

      // Remove crop rectangle
      if (cropRectRef.current) {
        canvas.remove(cropRectRef.current);
        cropRectRef.current = null;
        canvas.renderAll();
      }
    }
  }, [
    transform.showAspects,
    transform.selectedAspect,
    dispatch,
    isClient,
    canvasDimensions.width,
    canvasDimensions.height,
    activeFeature,
  ]);

  // Update crop rectangle when dimensions change from inputs
  useEffect(() => {
    if (!cropActive || !cropRectRef.current || !fabricCanvasRef.current) return;

    const cropRect = cropRectRef.current;
    const canvas = fabricCanvasRef.current;

    if (transform.width && transform.height) {
      // Keep the crop centered when dimensions change
      const currentCenterX = cropRect.left! + cropRect.width! / 2;
      const currentCenterY = cropRect.top! + cropRect.height! / 2;

      cropRect.set({
        width: transform.width,
        height: transform.height,
        left: currentCenterX - transform.width / 2,
        top: currentCenterY - transform.height / 2,
      });

      canvas.renderAll();
    }
  }, [transform.width, transform.height, cropActive]);

  const applyCrop = () => {
    const canvas = fabricCanvasRef.current;
    const cropRect = cropRectRef.current;

    if (!canvas || !cropRect) {
      console.error("Canvas or crop rectangle not available");
      return;
    }

    try {
      // Force the crop rectangle to update its coordinates
      canvas.renderAll();

      // Get crop rectangle coordinates and dimensions
      // Ensure we're using the actual position values
      const cropX = Math.round(cropRect.left || 0);
      const cropY = Math.round(cropRect.top || 0);
      const cropWidth = Math.round(cropRect.width! * cropRect.scaleX!);
      const cropHeight = Math.round(cropRect.height! * cropRect.scaleY!);

      console.log("Crop dimensions:", { cropX, cropY, cropWidth, cropHeight });

      // Temporarily hide the crop rectangle for clean image capture
      const cropRectVisibility = cropRect.visible;
      cropRect.set({ visible: false });
      canvas.renderAll();

      const currentCanvasState = canvas.toDataURL();

      // Restore crop rectangle visibility
      cropRect.set({ visible: cropRectVisibility });
      canvas.renderAll();

      const img = new Image();

      img.onload = () => {
        // Create a new canvas for cropping
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = cropWidth;
        tempCanvas.height = cropHeight;
        const ctx = tempCanvas.getContext("2d");

        if (!ctx) {
          console.error("Could not get context from temp canvas");
          return;
        }
        ctx.fillStyle = canvas.backgroundColor || "#e0e0e0"; // Use the canvas's actual background color
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Calculate the correct scale factor between the canvas display size and the image size
        const scaleX = img.width / canvas.getWidth();
        const scaleY = img.height / canvas.getHeight();

        // Apply the scale to get the correct source coordinates
        const srcX = cropX * scaleX;
        const srcY = cropY * scaleY;
        const srcWidth = cropWidth * scaleX;
        const srcHeight = cropHeight * scaleY;

        console.log("Source dimensions:", { srcX, srcY, srcWidth, srcHeight });

        // Draw only the cropped portion directly from the current canvas state
        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcWidth,
          srcHeight, // Source rectangle
          0,
          0,
          cropWidth,
          cropHeight // Destination rectangle
        );

        // Clear the canvas and remove all objects
        canvas.clear();
        canvas.setBackgroundColor("#e0e0e0", canvas.renderAll.bind(canvas));

        // Update Redux state with new dimensions
        dispatch(setImageWidth(cropWidth));
        dispatch(setImageHeight(cropHeight));
        dispatch(setTransformWidth(cropWidth));
        dispatch(setTransformHeight(cropHeight));

        // Create a new fabric image from the cropped canvas
        fabric.Image.fromURL(tempCanvas.toDataURL(), (croppedImg) => {
          // Add the cropped image to the canvas
          croppedImg.selectable = false;

          canvas.add(croppedImg);
          canvas.centerObject(croppedImg);
          canvas.renderAll();

          // Mark that we're now working with a cropped image
          imageIsCroppedRef.current = true;

          // After cropping, this becomes our new "no effect" state
          noEffectCanvasRef.current = canvas.toDataURL();
          // Reset effect tracking
          previousEffectRef.current = "none";
          // Clear processed image reference
          processedImageRef.current = null;

          console.log("Image cropped successfully");

          setTimeout(saveCurrentCanvasState, 300);
        });
      };

      img.src = currentCanvasState;
    } catch (error) {
      console.error("Error applying crop:", error);
    }
  };

  // Add function to create and update snap lines
  const createSnapLines = (canvas: fabric.Canvas) => {
    // Remove existing snap lines if they exist
    if (horizontalSnapLineRef.current) {
      canvas.remove(horizontalSnapLineRef.current);
      horizontalSnapLineRef.current = null;
    }
    if (verticalSnapLineRef.current) {
      canvas.remove(verticalSnapLineRef.current);
      verticalSnapLineRef.current = null;
    }

    // Create horizontal snap line
    horizontalSnapLineRef.current = new fabric.Line(
      [0, 0, canvas.width || 0, 0],
      {
        stroke: "red", // Changed to more visible color
        strokeWidth: 2, // Increased width
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        visible: false,
        objectCaching: false // Disable caching for better visibility
      }
    );

    // Create vertical snap line
    verticalSnapLineRef.current = new fabric.Line(
      [0, 0, 0, canvas.height || 0],
      {
        stroke: "red", // Changed to more visible color
        strokeWidth: 2, // Increased width
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        visible: false,
        objectCaching: false // Disable caching for better visibility
      }
    );

    // Add them to the canvas
    canvas.add(horizontalSnapLineRef.current, verticalSnapLineRef.current);

    // Ensure they're added at the top level so they're visible
    horizontalSnapLineRef.current.moveTo(999); // Move to high index
    verticalSnapLineRef.current.moveTo(999); // Move to high index
  };

  // Function to clear snap lines
  const clearSnapLines = () => {
    if (horizontalSnapLineRef.current) {
      horizontalSnapLineRef.current.set({ visible: false });
    }
    if (verticalSnapLineRef.current) {
      verticalSnapLineRef.current.set({ visible: false });
    }

    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.requestRenderAll();
    }
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      console.log("Text rendering skipped: Canvas not available");
      return;
    }

    console.log("Text rendering useEffect triggered", {
      textsAvailable: Boolean(texts),
      textsLength: texts?.length || 0,
      textsData: texts,
    });

    // Safety check to ensure texts is defined
    if (!texts || !Array.isArray(texts)) {
      console.log("Texts array is not defined or not an array");
      return;
    }

    // Clear existing text objects
    const existingTexts = canvas.getObjects("textbox");
    console.log(`Removing ${existingTexts.length} existing text objects`);

    existingTexts.forEach((obj) => {
      canvas.remove(obj);
    });

    // Create snap lines for the canvas
    createSnapLines(canvas);

    // Add new text objects from Redux state
    console.log(`Adding ${texts.length} text objects to canvas`);

    texts.forEach((text, index) => {
      console.log(`Creating text object ${index}:`, text);

      const textObj = new fabric.Textbox(text.content, {
        left: text.positionX,
        top: text.positionY,
        fontSize: text.fontSize,
        fill: text.fontColor,
        angle: text.rotatedAngle,
        width: text.width,
        selectable: true,
        hasControls: true,
        lockScalingFlip: true,
        editable: true,
        opacity: text.fontColorOpacity,
        textAlign: [
          "left",
          "center",
          "right",
        ].includes(text.textAlign)
          ? text.textAlign
          : "left",
        lineHeight:
          typeof text.lineSpacing === "number" && text.lineSpacing > 0
            ? text.lineSpacing
            : 1.2,
        textBackgroundColor: text.backgroundColor,
        fontFamily: text.fontFamily || "Arial",
        cornerColor: "white",
        cornerStrokeColor: "black",
        borderColor: "rgba(255,255,255,0.8)",
        cornerSize: 10,
        cornerStyle: "circle",
        transparentCorners: false,
        padding: 0,
      });
      textObj.set("fill", getRgbaColor(text, "font"));
      textObj.set("textBackgroundColor", getRgbaColor(text, "background"));

      // Make sure middle controls are visible for horizontal resizing
      textObj.setControlVisible("ml", true); // Middle LeftText
      textObj.setControlVisible("mr", true); // Middle Right
      textObj.setControlVisible("mt", false); // Middle Top
      textObj.setControlVisible("mb", false); // Middle Bottom
      textObj.setControlVisible("tr", false); // Middle Top
      textObj.setControlVisible("tl", false); // Middle Bottom
      textObj.setControlVisible("br", false); // Middle Top
      textObj.setControlVisible("bl", false); // Middle Bottom

      textObj.on("moving", () => {
        // Get canvas dimensions
        const canvasWidth = canvas.width || canvasDimensions.width;
        const canvasHeight = canvas.height || canvasDimensions.height;

        // Calculate center positions
        const objectCenterX =
          textObj.left! + (textObj.width! * textObj.scaleX!) / 2;
        const objectCenterY =
          textObj.top! + (textObj.height! * textObj.scaleY!) / 2;
        const canvasCenterX = canvasWidth / 2;
        const canvasCenterY = canvasHeight / 2;

        // Make sure snap lines exist
        if (!horizontalSnapLineRef.current || !verticalSnapLineRef.current) {
          createSnapLines(canvas);
        }

        // Check for horizontal center snap
        if (Math.abs(objectCenterX - canvasCenterX) < snapThreshold) {
          // Snap to center horizontally
          const adjustmentX = canvasCenterX - objectCenterX;
          textObj.set({
            left: textObj.left! + adjustmentX,
          });

          // Show horizontal center snap line
          if (horizontalSnapLineRef.current) {
            horizontalSnapLineRef.current.set({
              y1: 0,
              y2: canvasHeight,
              x1: canvasCenterX,
              x2: canvasCenterX,
              visible: false,
            });
            // Ensure it's at the top of the stack
            horizontalSnapLineRef.current.bringToFront();
          }
        } else {
          // Hide horizontal snap line if not snapping
          if (
            horizontalSnapLineRef.current &&
            horizontalSnapLineRef.current.visible
          ) {
            horizontalSnapLineRef.current.set({ visible: false });
          }
        }

        // Check for vertical center snap
        if (Math.abs(objectCenterY - canvasCenterY) < snapThreshold) {
          // Snap to center vertically
          const adjustmentY = canvasCenterY - objectCenterY;
          textObj.set({
            top: textObj.top! + adjustmentY,
          });

          // Show vertical center snap line
          if (verticalSnapLineRef.current) {
            verticalSnapLineRef.current.set({
              x1: 0,
              x2: canvasWidth,
              y1: canvasCenterY,
              y2: canvasCenterY,
              visible: false,
            });
            // Ensure it's at the top of the stack
            verticalSnapLineRef.current.bringToFront();
          }
        } else {
          // Hide vertical snap line if not snapping
          if (
            verticalSnapLineRef.current &&
            verticalSnapLineRef.current.visible
          ) {
            verticalSnapLineRef.current.set({ visible: false });
          }
        }

        // Important: Force canvas rendering after changing snap line visibility
        canvas.requestRenderAll();

        // Update position in Redux after snapping
        dispatch(
          setTextPosition({
            id: text.id,
            positionX: textObj.left || 0,
            positionY: textObj.top || 0,
          })
        );
      });

      // This fires after movement ends, which is a good time to save state
      textObj.on("moved", () => {
        console.log("Text position finalized, saving state");
        clearSnapLines();
        saveCurrentCanvasState();
      });

      textObj.on("rotating", () => {
        dispatch(
          setTextRotation({
            id: text.id,
            rotatedAngle: textObj.angle || 0,
          })
        );
      });

      textObj.on("rotated", () => {
        console.log("Text rotation finalized, saving state");
        saveCurrentCanvasState();
      });

      textObj.on("editing:exited", () => {
        const newText = textObj.text || "";
        if (newText !== text.content) {
          console.log(
            `Text content changed from "${text.content}" to "${newText}"`
          );
          dispatch(
            updateTextContent({
              id: text.id,
              value: newText,
            })
          );
          saveCurrentCanvasState();
        }
      });

      // Add a handler for modified event which captures ALL changes
      textObj.on("modified", () => {
        // clear all the snap lines
        clearSnapLines();

        // If width changed but scaling factors are 1, it was likely a ml/mr control
        if (
          Math.abs(textObj.scaleX! - 1) < 0.01 &&
          Math.abs(textObj.scaleY! - 1) < 0.01 &&
          textObj.width !== text.width
        ) {
          console.log(`Width changed via middle controls to: ${textObj.width}`);
          dispatch(
            setTextPosition({
              id: text.id,
              positionX: textObj.left || 0,
              positionY: textObj.top || 0,
            })
          );
          dispatch(
            setWidth({
              id: text.id,
              width: textObj.width || 70,
            })
          );
          saveCurrentCanvasState();
        }
      });

      textObj.on("mousedown", () => {
        console.log(`Text object ${index} clicked`);
        // Dispatch action to set selected text ID
        dispatch(selectText(texts[index].id));
        dispatch(setActiveFeature("text"));
      });

      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      console.log(`Text object ${index} added to canvas`);
    });

    // Also clear snap lines when selection changes
    canvas.on("selection:cleared", () => {
      console.log("Selection cleared, clearing snap lines");
      clearSnapLines();
    });

    // Clear snap lines when canvas is clicked (not on objects)
    canvas.on("mouse:down", function (opt) {
      if (!opt.target) {
        clearSnapLines();
      }
    });

    canvas.selection = false;

    canvas.renderAll();
    console.log("Canvas re-rendered with updated text objects");
  }, [texts, dispatch, canvasDimensions.width, canvasDimensions.height]); // Make sure we're only depending on the texts array

  // Function to synchronize canvas overlay state with Redux
  const syncOverlayStateWithCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Get current overlay info from canvas
    const currentOverlayInfo = getCurrentOverlayInfo(canvas);

    // Update Redux state based on what's actually on the canvas
    if (currentOverlayInfo) {
      // Canvas has an overlay - ensure Redux state matches
      if (selectedOverlay !== currentOverlayInfo.overlayId) {
        dispatch(setSelectedOverlay(currentOverlayInfo.overlayId));
      }
      if (overlayOpacity !== currentOverlayInfo.opacity) {
        dispatch(setOverlayOpacity(currentOverlayInfo.opacity));
      }
      if (overlayBlendMode !== currentOverlayInfo.blendMode) {
        dispatch(setOverlayBlendMode(currentOverlayInfo.blendMode));
      }
      overlayAppliedRef.current = true;
    } else {
      // Canvas has no overlay
      if (selectedOverlay !== 'none') {
        dispatch(setSelectedOverlay('none'));
      }
      overlayAppliedRef.current = false;
    }
  }, [dispatch, selectedOverlay, overlayOpacity, overlayBlendMode]);
  // Add keyboard shortcut handler
  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      // Only process if activeFeature is 'text' and a text is selected
      if (activeFeature === "text" && selectedTextId !== null) {
        const target = event.target as HTMLElement;

        // Skip if user is typing in an input field or textarea
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }

        // Check if we're editing text in the canvas (fabric's IText editing mode)
        if (fabricCanvasRef.current) {
          const activeObject = fabricCanvasRef.current.getActiveObject();
          if (activeObject && activeObject.isEditing) {
            return;
          }
        }

        // Backspace or Delete to delete selected text
        if (event.key === "Backspace" || event.key === "Delete") {
          console.log("Delete shortcut detected");
          event.preventDefault();
          dispatch(deleteText(selectedTextId));
        }

        // Ctrl+D or Cmd+D to duplicate text
        if (
          (event.key === "d" || event.key === "D") &&
          (event.ctrlKey || event.metaKey)
        ) {
          console.log("Duplicate shortcut detected");
          event.preventDefault();
          dispatch(duplicateText(selectedTextId));
        }
      }
    },
    [activeFeature, selectedTextId, dispatch]
  );

  // Set up keyboard shortcut listeners
  useEffect(() => {
    // Add event listener
    document.addEventListener("keydown", handleKeyboardShortcuts);

    // Cleanup event listener
    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

  // Function to update brush settings
  const updateBrushSettings = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Get current brush
    let currentBrush;

    // Based on hardness, use either PencilBrush (hard) or CircleBrush (soft)
    if (brush.hardness > 70) {
      // Use PencilBrush for harder strokes
      if (!(canvas.freeDrawingBrush instanceof fabric.PencilBrush)) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      currentBrush = canvas.freeDrawingBrush as fabric.PencilBrush;
    } else {
      // Use CircleBrush for softer strokes
      if (!(canvas.freeDrawingBrush instanceof fabric.CircleBrush)) {
        canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
      }
      currentBrush = canvas.freeDrawingBrush as fabric.CircleBrush;
    }

    // Save brush reference
    brushRef.current = currentBrush;

    // Convert hex color and opacity to rgba
    const hex = brush.color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const color = `rgba(${r}, ${g}, ${b}, ${brush.opacity / 100})`;

    // Set brush properties
    currentBrush.width = brush.size;
    currentBrush.color = color;

    // Set brush-specific properties
    if (currentBrush instanceof fabric.CircleBrush) {
      // For softer brush, adjust the density based on hardness
      currentBrush.density = 10 + brush.hardness / 10;
    } else if (currentBrush instanceof fabric.PencilBrush) {
      // For pencil brush, adjust the smoothness based on hardness
      currentBrush.decimate = 8 - brush.hardness / 20;
    }

    console.log("Brush updated:", {
      size: brush.size,
      color: color,
      hardness: brush.hardness,
      opacity: brush.opacity,
    });
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (activeFeature === "brush") {
      console.log("Activating drawing mode");
      canvas.isDrawingMode = true;
      updateBrushSettings();
    } else {
      console.log("Deactivating drawing mode");
      canvas.isDrawingMode = false;
    }

    const handlePathCreated = () => {
      console.log("Brush stroke completed");
      saveCurrentCanvasState(); // Your own function to save state
    };

    canvas.on("path:created", handlePathCreated);

    return () => {
      canvas.off("path:created", handlePathCreated); // Cleanup
    };
  }, [activeFeature]);

  // Update brush settings when they change
  useEffect(() => {
    // Only update if in drawing mode
    if (activeFeature === "brush") {
      updateBrushSettings();
    }
  }, [brush.size, brush.hardness, brush.color, brush.opacity]);

  // Update canvas background color effect for better visibility
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Make background lighter when using brush for better visibility
    if (activeFeature === "brush") {
      canvas.backgroundColor = "#f5f5f5";
    } else {
      canvas.backgroundColor = "#e0e0e0";
    }

    canvas.renderAll();
  }, [activeFeature]);

  // Replace the existing overlay useEffects with this improved implementation

  // First useEffect for handling overlay selection changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || imageStatus !== "success") return;

    // Skip if we're currently restoring from history
    if (isRestoringFromHistory.current) return;

    console.log(`Overlay selection changed to: ${selectedOverlay}`);

    if (selectedOverlay !== "none") {
      // Force remove any existing overlay first
      removeOverlay(canvas);

      // Apply the new overlay
      applyOverlay(
        canvas,
        selectedOverlay,
        overlayOpacity,
        overlayBlendMode
      ).then(() => {
        // Mark overlay as applied
        overlayAppliedRef.current = true;

        // Save canvas state after overlay is applied
        if (!isRestoringFromHistory.current) {
          setTimeout(saveCurrentCanvasState, 200);
        }
      }).catch(err => {
        console.error("Failed to apply overlay:", err);
      });
    } else {
      // Remove overlay when "none" is selected
      if (removeOverlay(canvas)) {
        overlayAppliedRef.current = false;

        // Save canvas state after overlay is removed
        if (!isRestoringFromHistory.current) {
          setTimeout(saveCurrentCanvasState, 200);
        }
      }
    }
  }, [selectedOverlay, imageStatus]);

  // Second useEffect to handle opacity and blend mode changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !overlayAppliedRef.current || isRestoringFromHistory.current) return;

    console.log(`Overlay properties changed - opacity: ${overlayOpacity}, blend mode: ${overlayBlendMode}`);

    // Update the overlay's properties
    updateOverlayProperties(canvas, overlayOpacity, overlayBlendMode);

    // Save canvas state after properties are updated (with debouncing)
    const timeoutId = setTimeout(saveCurrentCanvasState, 300);
    return () => clearTimeout(timeoutId);
  }, [overlayOpacity, overlayBlendMode]);

  // handle export
  const handleExport = async () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // Create a temporary canvas with the exact dimensions from state
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d");

    if (ctx) {
      // Calculate the top-left corner to start extracting
      const startX = (canvasDimensions.width - width) / 2;
      const startY = (canvasDimensions.height - height) / 2;

      // Get the entire canvas as an image first
      const fullCanvasDataUrl = canvas.toDataURL({
        format: exportFormat,
        // multiplier: 2,
        // enableRetinaScaling: true
      });

      const img = new Image();
      img.onload = () => {
        // Draw only the portion we need onto the temp canvas
        console.log("params:", startX, startY, width, height);
        ctx.drawImage(
          img,
          startX,
          startY,
          width,
          height, // Source coordinates and dimensions
          0,
          0,
          width,
          height // Destination coordinates and dimensions
        );

        // Get data URL from the temp canvas with only the needed portion
        const croppedDataUrl = tempCanvas.toDataURL(
          exportFormat === "jpg" ? "image/jpeg" : `image/${exportFormat}`,
          0.95 // Quality for JPEG/WebP
        );

        // Create a link to download the image
        const link = document.createElement("a");
        link.href = croppedDataUrl;
        link.download = `image-export.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset export state
        dispatch(setIsExporting(false));
      };

      img.src = fullCanvasDataUrl;
    } else {
      console.error("Could not get 2D context from temporary canvas");
      dispatch(setIsExporting(false));
    }
  };

  useEffect(() => {
    if (isExporting) {
      const exportFn = async () => await handleExport();
      exportFn();
    }
  }, [isExporting]);

  // handle export
  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // Create a temporary canvas with the exact dimensions from state
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d");

    if (ctx) {
      // Calculate the top-left corner to start extracting
      const startX = (canvasDimensions.width - width) / 2;
      const startY = (canvasDimensions.height - height) / 2;

      // Get the entire canvas as an image first
      const fullCanvasDataUrl = canvas.toDataURL({ format: exportFormat });

      const img = new Image();
      img.onload = async () => {
        // Draw only the portion we need onto the temp canvas
        ctx.drawImage(
          img,
          startX,
          startY,
          width,
          height, // Source coordinates and dimensions
          0,
          0,
          width,
          height // Destination coordinates and dimensions
        );

        // Get data URL from the temp canvas with only the needed portion
        const croppedDataUrl = tempCanvas.toDataURL(
          exportFormat === "jpg" ? "image/jpeg" : `image/${exportFormat}`,
          0.95 // Quality for JPEG/WebP
        );

        // Write the code here
        const blob = await (await fetch(croppedDataUrl)).blob();

        const formData = new FormData();
        formData.append("image", blob, `upscaled.${exportFormat}`);
        formData.append("imageId", imageId);
        formData.append("versionId", versionId);

        try {
          const response = await fetch(
            `${baseUrl}/images/add_upscaled_image`,
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await response.json();

          if (response.ok) {
            console.log("Upload successful:", data.imageUrl);
            router.back();
            // Optionally: update Redux state or show a success toast
          } else {
            console.error("Upload failed:", data.message);
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }

        // Reset export state
        dispatch(setIsSaving(false));
      };

      img.src = fullCanvasDataUrl;
    } else {
      console.error("Could not get 2D context from temporary canvas");
      dispatch(setIsSaving(false));
    }
  };

  useEffect(() => {
    if (isSaving) {
      const exportFn = async () => await handleSave();
      exportFn();
    }
  }, [isSaving]);

  // Add useEffect to handle template selection and application
  useEffect(() => {
    if (!selectedTemplate || !fabricCanvasRef.current || imageStatus !== "success") return;

    console.log("Applying template:", selectedTemplate.name);

    // Set flag to prevent adding restored states back to history
    isRestoringFromHistory.current = true;

    // Apply basic adjustments
    dispatch(setBrightness(selectedTemplate.basicAdjustments.brightness));
    dispatch(setContrast(selectedTemplate.basicAdjustments.contrast));
    dispatch(setSaturation(selectedTemplate.basicAdjustments.saturation));
    dispatch(setGamma(selectedTemplate.basicAdjustments.gamma));
    dispatch(setConvolute(selectedTemplate.basicAdjustments.convolute));

    // Apply rotation
    dispatch(setRotatedAngle(selectedTemplate.rotatedAngle));

    // Apply filter settings
    dispatch(setSelectedFilter(selectedTemplate.filter.selectedFilter));
    if (selectedTemplate.filter.selectedFilter !== "none") {
      dispatch(setFilterIntensity(selectedTemplate.filter.filterIntensity));
    }

    // Apply overlay settings
    dispatch(setSelectedOverlay(selectedTemplate.overlay.selectedOverlay));
    if (selectedTemplate.overlay.selectedOverlay !== "none") {
      dispatch(setOverlayOpacity(selectedTemplate.overlay.overlayOpacity));
      dispatch(setOverlayBlendMode(selectedTemplate.overlay.overlayBlendMode));
    }

    // Apply effect if specified
    if (selectedTemplate.effect.length > 0) {
      dispatch(setActiveEffect(selectedTemplate.effect as any));
    }

    // Add texts from template if any
    if (selectedTemplate.texts && selectedTemplate.texts.length > 0) {
      // Clone the texts to avoid reference issues
      const newTexts = selectedTemplate.texts.map((text, index) => ({
        ...text,
        id: index, // Reassign IDs to ensure uniqueness
      }));

      dispatch({
        type: "studio/replaceTexts",
        payload: newTexts,
      });
    }

    // Reset flag after a short delay to allow all changes to apply
    setTimeout(() => {
      isRestoringFromHistory.current = false;
      // Save the state after template is applied
      saveCurrentCanvasState();
    }, 500);

  }, [selectedTemplate, imageStatus, dispatch, saveCurrentCanvasState]);

  return (
    <div className="flex justify-center items-center p-4">
      {isClient ? (
        <div className="relative">
          <div ref={canvasContainerRef} className="canvas-container" />
          {imageStatus === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <p className="text-muted-foreground">Loading image...</p>
            </div>
          )}
          {imageStatus === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-100/20">
              <p className="text-red-500">Failed to load image</p>
            </div>
          )}
          {activeFeature === "transform" && (
            <div className="absolute top-2 right-2">
              <Button
                onClick={() => {
                  applyCrop();
                  dispatch(setShowAspects(false));
                }}

              >
                Apply
              </Button>
            </div>
          )}
          {activeFeature === "brush" && (
            <div className="absolute top-2 right-2">
              <div className="text-xs text-white bg-black/50 px-2 py-1 rounded-md">
                Drawing Mode Active
              </div>
            </div>
          )}
          {selectedStickerId && (
            <div className="absolute top-2 left-2 z-10">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSticker}
                className="flex items-center gap-1"
              >
                <Trash2 size={16} />
                {/* <span>Delete Sticker</span> */}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className="border border-border rounded-md shadow-sm flex items-center justify-center bg-muted"
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
          }}
        >
          <p className="text-muted-foreground">Initializing canvas...</p>
        </div>
      )}
    </div>
  );
};

export default FabricCanvas;
