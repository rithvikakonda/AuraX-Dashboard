import React, { useRef, useEffect } from "react";
import {
  Pen,
  Lock,
  Eye,
  Unlock,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setSelectedLayer,
  setLayerName,
  setLayerEditable,
  toggleLayerLock,
  toggleLayerVisibility,
} from "@/redux/features/layerSlice";

const LayersPanel = () => {
  const dispatch = useAppDispatch();
  const { selectedLayer, layers } = useAppSelector((state) => state.layer);
  
  const inputRefs = useRef<{ [key: number]: React.RefObject<HTMLInputElement | null> }>({});
  
  layers.forEach(layer => {
    if (!inputRefs.current[layer.id]) {
      inputRefs.current[layer.id] = React.createRef<HTMLInputElement>();
    }
  });

  const handleLayerClick = (layerId: number) => {
    dispatch(setSelectedLayer(layerId));
  };

  const handleNameChange = (layerId: number, name: string) => {
    dispatch(setLayerName({ layerId, name }));
  };

  const handleEditToggle = (e: React.MouseEvent, layerId: number, isEditable: boolean) => {
    e.stopPropagation();
    dispatch(setLayerEditable({ layerId, editable: !isEditable }));
  };

  const handleEndEditing = (layerId: number) => {
    dispatch(setLayerEditable({ layerId, editable: false }));
  };

  const handleLockToggle = (e: React.MouseEvent, layerId: number) => {
    e.stopPropagation();
    dispatch(toggleLayerLock(layerId));
  };

  const handleVisibilityToggle = (e: React.MouseEvent, layerId: number) => {
    e.stopPropagation();
    dispatch(toggleLayerVisibility(layerId));
  };

  useEffect(() => {
    const editableLayer = layers.find(layer => layer.editable);
  
    if (editableLayer && inputRefs.current[editableLayer.id]?.current) {
      inputRefs.current[editableLayer.id].current?.focus();
    }
  }, [layers]);

  const renderLayerControls = (layer: any) => {
    return (
      <div className="flex items-center gap-2 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => handleEditToggle(e, layer.id, layer.editable)}
        >
          <Pen
            className={`h-4 w-4 ${
              layer.editable ? "text-blue-500" : "text-gray-500"
            }`}
          />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => handleLockToggle(e, layer.id)}
        >
          {layer.locked ? (
            <Lock className="h-4 w-4 text-red-500" />
          ) : (
            <Unlock className="h-4 w-4 text-gray-500" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => handleVisibilityToggle(e, layer.id)}
        >
          {layer.visible ? (
            <Eye className="h-4 w-4 text-gray-500" />
          ) : (
            <EyeOff className="h-4 w-4 text-red-500" />
          )}
        </Button>
      </div>
    );
  };

  // Function to render status indicators (always visible)
  const renderLayerStatus = (layer: any) => {
    return (
      <div className="flex items-center gap-1">
        {/* Show small lock indicator if locked */}
        {layer.locked && (
          <Lock className="h-3 w-3 text-red-500" />
        )}
        
        {/* Show small eye-off indicator if hidden */}
        {!layer.visible && (
          <EyeOff className="h-3 w-3 text-red-500" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      <p className="text-sm text-muted-foreground mb-2">
        Manage and organize your layers
      </p>
      
      <div className="border rounded-md">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
              selectedLayer === layer.id ? "bg-accent" : "hover:bg-accent/50"
            } ${layer.id !== layers.length - 1 ? "border-b" : ""}`}
            onClick={(e) => {
              if (!layer.editable) {
                e.preventDefault();
                handleLayerClick(layer.id);
              }
            }}
          >
            <div className="flex items-center gap-2 max-w-[70%]">
              {layer.editable ? (
                <Input
                  ref={inputRefs.current[layer.id]}
                  value={layer.name}
                  onChange={(e) => handleNameChange(layer.id, e.target.value)}
                  className="h-7 text-sm px-2 py-0 w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") {
                      handleEndEditing(layer.id);
                    }
                  }}
                  onBlur={() => handleEndEditing(layer.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="text-sm font-medium truncate">
                    {layer.name}
                  </span>
                  {/* Show status indicators next to name when not selected */}
                  {selectedLayer !== layer.id && renderLayerStatus(layer)}
                </>
              )}
            </div>

            {/* Only show controls when this layer is selected */}
            {selectedLayer === layer.id && renderLayerControls(layer)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayersPanel;
