import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AlertColor } from "@mui/material";

interface UiState {
  snackbar: { open: boolean; message: string; severity: AlertColor };
}

const initialState: UiState = {
  snackbar: { open: false, message: "", severity: "success" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<{ message: string; severity: AlertColor }>) => {
      state.snackbar = { open: true, ...action.payload };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const { showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;