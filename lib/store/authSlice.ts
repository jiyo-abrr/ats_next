import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import * as authService from "@/features/auth/authService";
import type { LoginInput, User } from "@/features/auth/schema";

// 1. State type
interface AuthState {
  user: User | null;
  /** false until the first `fetchMe` settles. */
  resolved: boolean;
  loading: boolean;
  error: string | null;
}

// 2. Initial state
const initialState: AuthState = {
  user: null,
  resolved: false,
  loading: false,
  error: null,
};

// 3. Async thunks
export const fetchMe = createAsyncThunk("auth/fetchMe", async () =>
  authService.getMe(),
);

export const login = createAsyncThunk(
  "auth/login",
  async (body: LoginInput) => (await authService.login(body)).user,
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (form: FormData) => (await authService.signup(form)).user,
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
});

// 4. Slice
const authSlice = createSlice({
  name: "auth",
  initialState,

  // 5. Synchronous reducers
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  // 6. Async reducers
  extraReducers: (builder) => {
    const setUser = (state: AuthState, user: User) => {
      state.user = user;
      state.resolved = true;
      state.loading = false;
      state.error = null;
    };

    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => setUser(state, action.payload))
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.resolved = true;
        state.loading = false;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => setUser(state, action.payload))
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Login failed";
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => setUser(state, action.payload))
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Sign up failed";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.resolved = true;
      });
  },
});

// 7. Action exports
export const { clearAuthError } = authSlice.actions;

// 8. Reducer export
export default authSlice.reducer;
