import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthResponse, AuthUser } from "./auth.types";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<AuthResponse>
    ) => {
      const data = action.payload;

      state.accessToken = data.token;

      state.user = {
        id: data.userId,
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        userType: data.userType,
        fullName: data.fullName,
        roles: data.roles,
        permissions: data.permissions,
      };
    },

    logout: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
