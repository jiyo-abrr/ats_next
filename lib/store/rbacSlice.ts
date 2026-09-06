import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";

import * as rbacService from "@/features/rbac/rbacService";
import type { Permission, Role } from "@/features/rbac/schema";

// 1. State type
interface RbacState {
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  /** `${roleName}:${permissionKey}` currently being toggled */
  pending: string | null;
  error: string | null;
}

// 2. Initial state
const initialState: RbacState = {
  roles: [],
  permissions: [],
  loading: false,
  pending: null,
  error: null,
};

// 3. Async thunks
export const fetchRbac = createAsyncThunk("rbac/fetchRbac", async () => {
  const [roles, permissions] = await Promise.all([
    rbacService.listRoles(),
    rbacService.listPermissions(),
  ]);
  return { roles, permissions };
});

export const grantPermission = createAsyncThunk(
  "rbac/grantPermission",
  async ({ roleName, permissionKey }: { roleName: string; permissionKey: string }) => {
    await rbacService.grant(roleName, permissionKey);
    return { roleName, permissionKey };
  },
);

export const revokePermission = createAsyncThunk(
  "rbac/revokePermission",
  async ({ roleName, permissionKey }: { roleName: string; permissionKey: string }) => {
    await rbacService.revoke(roleName, permissionKey);
    return { roleName, permissionKey };
  },
);

// 4. Slice
const rbacSlice = createSlice({
  name: "rbac",
  initialState,

  // 5. Synchronous reducers
  reducers: {},

  // 6. Async reducers
  extraReducers: (builder) => {
    const applyToggle = (
      state: RbacState,
      roleName: string,
      permissionKey: string,
      grant: boolean,
    ) => {
      const role = state.roles.find((r) => r.name === roleName);
      const perm = state.permissions.find((p) => p.key === permissionKey);
      if (!role || !perm) return;
      const has = role.permissions.some((p) => p.key === permissionKey);
      if (grant && !has) role.permissions.push(perm);
      if (!grant && has)
        role.permissions = role.permissions.filter(
          (p) => p.key !== permissionKey,
        );
    };

    builder
      .addCase(fetchRbac.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRbac.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles;
        state.permissions = action.payload.permissions;
      })
      .addCase(fetchRbac.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load access control";
      })
      .addCase(grantPermission.fulfilled, (state, action) => {
        state.pending = null;
        applyToggle(
          state,
          action.payload.roleName,
          action.payload.permissionKey,
          true,
        );
      })
      .addCase(revokePermission.fulfilled, (state, action) => {
        state.pending = null;
        applyToggle(
          state,
          action.payload.roleName,
          action.payload.permissionKey,
          false,
        );
      })
      .addMatcher(
        isAnyOf(grantPermission.pending, revokePermission.pending),
        (state, action) => {
          const { roleName, permissionKey } = action.meta.arg;
          state.pending = `${roleName}:${permissionKey}`;
        },
      )
      .addMatcher(
        isAnyOf(grantPermission.rejected, revokePermission.rejected),
        (state) => {
          state.pending = null;
        },
      );
  },
});

// 8. Reducer export
export default rbacSlice.reducer;
