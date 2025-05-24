// src/redux/features/clientSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

export interface Client {
  clientId: string;
  name: string;
  email: string;
  phone: string;
}

interface ClientState {
  clients: Client[];
  searchQuery: string;
  currentPage: number;
  itemsPerPage: number;
  deleteModal: {
    isOpen: boolean;
    client: Client | null;
  };
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialClients: Client[] = [];

const initialState: ClientState = {
  clients: initialClients,
  searchQuery: '',
  currentPage: 1,
  itemsPerPage: 10,
  deleteModal: {
    isOpen: false,
    client: null,
  },
  status: "idle",
  error: null,
};

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getClients = createAsyncThunk<Client[]>(
  "clients/getClients",
  async (_, { rejectWithValue }) => {
    try {
      const clients_list_res = await axios.get(`${baseUrl}/clients/get_clients`)

      // Check if the request was successful
      if (!clients_list_res.data.success) {
        return rejectWithValue(clients_list_res.data.message || 'Failed to retrieve clients');
      }

      return clients_list_res.data.transformedClients
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        axiosError.response?.data?.message ||
        axiosError.message ||
        'An unknown error occurred'
      );
    }
  }
)

export const deleteClient = createAsyncThunk(
  "clients/deleteClient",
  async (client: Client | null, { rejectWithValue }) => {
    if (client) {
      try {
        const response = await axios.post(`${baseUrl}/clients/delete_client`, {
          email: client.email
        })
        return response.data
      } catch (error) {
        const axiosError = error as AxiosError;
        return rejectWithValue(
          axiosError.response?.data?.message ||
          axiosError.message ||
          "An unknown error occurred"
        );
      }
    }
  }
)

export const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
    },
    openDeleteModal: (state, action: PayloadAction<Client>) => {
      state.deleteModal = {
        isOpen: true,
        client: action.payload,
      };
    },
    closeDeleteModal: (state) => {
      state.deleteModal = {
        isOpen: false,
        client: null,
      };
    },
  },
  extraReducers: (builder) => { // add alternates
    builder
      .addCase(getClients.fulfilled, (state, action) => {
        state.clients = action.payload
      })
      .addCase(deleteClient.fulfilled, (state) => {
        state.clients = state.clients.filter(
          client => client.email !== state.deleteModal.client!.email
        );
        state.deleteModal.isOpen = false
        state.deleteModal.client = null
      })
  }
});

export const {
  setSearchQuery,
  setCurrentPage,
  setItemsPerPage,
  openDeleteModal,
  closeDeleteModal,
} = clientSlice.actions;

export default clientSlice.reducer;
