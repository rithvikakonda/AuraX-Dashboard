import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface fields {
    name: string;
    emailUsername: string;
    domain: string;
    phone: string;
}

interface CreateClientState {
    name: string;
    emailUsername: string;
    domain: string;
    phone: string;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: CreateClientState = {
    name: "",
    emailUsername: "",
    domain: "gmail.com",
    phone: "",
    status: "idle",
    error: null,
};

const createClientSlice = createSlice({
    name: "create_client",
    initialState,
    reducers: {
        setField: (state, action: PayloadAction<{ field: string; value: string }>) => {
            state[action.payload.field as keyof fields] = action.payload.value;
        },
    },
});

export const { setField } = createClientSlice.actions;
export default createClientSlice.reducer;