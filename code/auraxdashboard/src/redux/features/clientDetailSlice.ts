// src/redux/features/imageSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';


// Define the types for our state
export interface ImageVersion {
  versionId: string;
  promptUsed: string;
  modelUsed: string;
  generatedImageUrl: string;
  upscaledImageUrl: string;
}

interface Image {
  imageId: string;
  originalImageUrl: string;
  promptUsed: string;
  modelUsed: string
  versions: ImageVersion[]
}

export interface ClientDetailState {
  clientId: string;
  clientName: string;
  AddNewVersionModal: {
    isOpen: boolean;
    AIModel: string;
    prompt: string;
    imageId: string;
  },
  ReplaceGeneratedModal: {
    isOpen: boolean;
    AIModel: string;
    prompt: string;
    imageId: string;
    versionId: string;
  },
  AddNewImageModal: {
    isOpen: boolean;
  },
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  },
  images: Image[],
  downloadStatus: {
    isLoading: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | null;
  };
}

// Initial state
const initialState: ClientDetailState = {
  clientId: '',
  clientName: '',
  AddNewVersionModal: {
    isOpen: false,
    AIModel: 'Stable Diffusion',
    prompt: '',
    imageId: ""
  },
  ReplaceGeneratedModal: {
    isOpen: false,
    AIModel: 'Stable Diffusion',
    prompt: '',
    imageId: "",
    versionId: ""
  },
  AddNewImageModal: {
    isOpen: false,
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
  },
  images: [],
  downloadStatus: {
    isLoading: false,
    message: '',
    type: null
  }
};

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getClientDetails = createAsyncThunk(
  "client_detail/getClientDetails",
  async (clientId: string | null, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseUrl}/clients/get_client_details`, { clientId });
      // console.log(response.data)
      return response.data;
    } catch (error: any) {
      console.error("Error fetching client details:", error);

      // Extract error message
      let errorMessage = "An unexpected error occurred";
      if (error.response) {
        errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from the server. Please try again.";
      } else {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Create the slice
export const ClientDetailSlice = createSlice({
  name: 'client_detail',
  initialState,
  reducers: {
    ShowAddNewVersionModal: (state, action: PayloadAction<boolean>) => {
      state.AddNewVersionModal.isOpen = action.payload;
      state.AddNewVersionModal.AIModel = "Stable Diffusion"
      state.AddNewVersionModal.prompt = ""
      if (action.payload === false) {
        state.AddNewVersionModal.imageId = ""
      }
    },
    ShowReplaceGeneratedModal: (state, action: PayloadAction<boolean>) => {
      state.ReplaceGeneratedModal.isOpen = action.payload;
      state.ReplaceGeneratedModal.AIModel = "Stable Diffusion"
      state.ReplaceGeneratedModal.prompt = ""
      if (action.payload === false) {
        state.ReplaceGeneratedModal.imageId = ""
      }
    },
    ShowAddNewImageModal: (state, action: PayloadAction<boolean>) => {
      state.AddNewImageModal.isOpen = action.payload;
    },
    AddToImages: (state, action: PayloadAction<Image>) => {
      state.images.push(action.payload)
    },
    AddToGeneratedImage: (state, action: PayloadAction<{ imageId: string, versionId: string, imageUrl: string }>) => {
      state.images.forEach((image) => {
        if (image.imageId === action.payload.imageId) {
          image.versions.forEach((version) => {
            if (version.versionId === action.payload.versionId) {
              version.upscaledImageUrl = action.payload.imageUrl
            }
          })
        }
      });
    },
    AddToVersions: (state, action: PayloadAction<{ latestVersion: ImageVersion; imageId: string }>) => {
      state.images.forEach((image) => {
        if (image.imageId === action.payload.imageId) {
          image.versions.push(action.payload.latestVersion);
        }
      });
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    setTotalItems: (state, action: PayloadAction<number>) => {
      state.pagination.totalItems = action.payload;
    },
    setNewVersionPrompt: (state, action: PayloadAction<string>) => {
      state.AddNewVersionModal.prompt = action.payload
    },
    setNewVersionModel: (state, action: PayloadAction<string>) => {
      state.AddNewVersionModal.AIModel = action.payload
    },
    setImageId: (state, action: PayloadAction<string>) => {
      state.AddNewVersionModal.imageId = action.payload;
    },
    setImageIdReplacement: (state, action: PayloadAction<string>) => {
      state.ReplaceGeneratedModal.imageId = action.payload;
    },
    setVersionIdReplacement: (state, action: PayloadAction<string>) => {
      state.ReplaceGeneratedModal.versionId = action.payload;
    },
    setReplacementPrompt: (state, action: PayloadAction<string>) => {
      state.ReplaceGeneratedModal.prompt = action.payload
    },
    setReplacementModel: (state, action: PayloadAction<string>) => {
      state.ReplaceGeneratedModal.AIModel = action.payload
    },
    clearDownloadStatus: (state) => {
      state.downloadStatus = {
        isLoading: false,
        message: '',
        type: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClientDetails.fulfilled, (state, action) => {
        state.clientId = action.payload.clientData._id
        state.clientName = action.payload.clientData.clientName
        state.images = action.payload.clientData.images
      })
      .addCase(downloadUpscaledImages.pending, (state) => {
        state.downloadStatus.isLoading = true;
        state.downloadStatus.message = 'Preparing download...';
        state.downloadStatus.type = 'info';
      })
      .addCase(downloadUpscaledImages.fulfilled, (state, action) => {
        state.downloadStatus.isLoading = false;
        state.downloadStatus.message = action.payload.message;
        state.downloadStatus.type = 'success';
      })
      .addCase(downloadUpscaledImages.rejected, (state, action) => {
        state.downloadStatus.isLoading = false;
        state.downloadStatus.message = action.payload as string;
        state.downloadStatus.type = 'error';
      });
  }
});

// For dowloading upscaled images
export const downloadUpscaledImages = createAsyncThunk(
  "client_detail/downloadUpscaledImages",
  async (urls: string[], { rejectWithValue }) => {
    try {
      if (urls.length === 0 || urls.every(url => !url)) {
        return rejectWithValue("No upscaled images available to download");
      }

      // Filter out empty URLs
      const validUrls = urls.filter(url => url && url !== "");

      if (validUrls.length === 0) {
        return rejectWithValue("No valid upscaled images available to download");
      }

      // Create a new JSZip instance
      const zip = new JSZip();

      // Fetch all images and add them to the zip
      const imagePromises = validUrls.map(async (url, index) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.error(`Failed to fetch image from ${url}`);
            return;
          }
          const blob = await response.blob();
          zip.file(`${index + 1}.png`, blob);
        } catch (error) {
          console.error(`Error processing image ${url}:`, error);
        }
      });

      // Wait for all images to be added to the zip
      await Promise.all(imagePromises);

      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Save the zip file
      saveAs(zipBlob, `upscaled_images.zip`);

      return {
        success: true,
        message: `Successfully downloaded ${validUrls.length} upscaled images`,
        count: validUrls.length
      };
    } catch (error: any) {
      console.error("Error downloading upscaled images:", error);
      return rejectWithValue(error.message || "Failed to download upscaled images");
    }
  }
);

export const {
  ShowAddNewVersionModal,
  ShowReplaceGeneratedModal,
  ShowAddNewImageModal,
  setCurrentPage,
  setItemsPerPage,
  setTotalItems,
  setNewVersionPrompt,
  setNewVersionModel,
  setReplacementPrompt,
  setReplacementModel,
  setImageId,
  setImageIdReplacement,
  setVersionIdReplacement,
  AddToImages,
  AddToVersions,
  AddToGeneratedImage,
  clearDownloadStatus } = ClientDetailSlice.actions;
const clientDetailReducer = ClientDetailSlice.reducer; // Define imageReducer variable
export default clientDetailReducer; // Export imageReducer as default
