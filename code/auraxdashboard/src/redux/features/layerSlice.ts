import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Layer {
  id: number;
  name: string;
  editable: boolean;
  locked: boolean;
  visible: boolean;
}

interface LayerState {
  selectedLayer: number | null;
  layers: Layer[];
  dropdownOpen: boolean;
}

const initialState: LayerState = {
  selectedLayer: null,
  layers: [
    {
      id: 0,
      name: 'Headline',
      editable: false,
      locked: false,
      visible: true,
    },
    {
      id: 1,
      name: 'Description',
      editable: false,
      locked: false,
      visible: true,
    },
  ],
  dropdownOpen: false,
};

const layerSlice = createSlice({
  name: 'layer',
  initialState,
  reducers: {
    setSelectedLayer: (state, action: PayloadAction<number | null>) => {
      state.selectedLayer = action.payload === state.selectedLayer ? null : action.payload;
    },
    
    setDropdownOpen: (state, action: PayloadAction<boolean>) => {
      state.dropdownOpen = action.payload;
    },
    
    setLayerName: (state, action: PayloadAction<{ layerId: number; name: string }>) => {
      const layerIndex = state.layers.findIndex(layer => layer.id === action.payload.layerId);
      if (layerIndex !== -1) {
        state.layers[layerIndex].name = action.payload.name;
      }
    },
    
    setLayerEditable: (state, action: PayloadAction<{ layerId: number; editable: boolean }>) => {
      const layerIndex = state.layers.findIndex(layer => layer.id === action.payload.layerId);
      if (layerIndex !== -1) {
        state.layers[layerIndex].editable = action.payload.editable;
      }
    },
    
    toggleLayerLock: (state, action: PayloadAction<number>) => {
      const layerIndex = state.layers.findIndex(layer => layer.id === action.payload);
      if (layerIndex !== -1) {
        state.layers[layerIndex].locked = !state.layers[layerIndex].locked;
      }
    },
    
    toggleLayerVisibility: (state, action: PayloadAction<number>) => {
      const layerIndex = state.layers.findIndex(layer => layer.id === action.payload);
      if (layerIndex !== -1) {
        state.layers[layerIndex].visible = !state.layers[layerIndex].visible;
      }
    },
  },
});

export const {
  setSelectedLayer,
  setDropdownOpen,
  setLayerName,
  setLayerEditable,
  toggleLayerLock,
  toggleLayerVisibility,
} = layerSlice.actions;

export default layerSlice.reducer;
