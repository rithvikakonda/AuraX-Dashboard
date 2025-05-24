// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './features/clientSlice';
import createClientReducer from './features/createClientSlice'
import clientDetailReducer from './features/clientDetailSlice';
import studioReducer from './features/studioSlice';
import layerReducer from './features/layerSlice';

export const store = configureStore({
  reducer: {
    clients: clientReducer,
    create_client: createClientReducer,
    client_detail: clientDetailReducer,
    studio: studioReducer,
    layer: layerReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
