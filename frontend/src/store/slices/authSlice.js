import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

// fetchMe uses raw axios to avoid circular import with api/index.js
// The api instance imports from store which imports authSlice → circular.
// Raw axios is safe here: on first load the token is fresh enough.
export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (!token || !refreshToken) {
        return rejectWithValue({ isAuthError: true, message: 'No active session' });
      }

      // If refresh token is expired, session is gone without making any network request
      if (isTokenExpired(refreshToken)) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue({ isAuthError: true, message: 'Session expired' });
      }

      let activeToken = token;

      // If access token is expired, refresh it first
      if (isTokenExpired(token)) {
        try {
          const refreshRes = await axios.post('/api/auth/refresh', { refreshToken });
          activeToken = refreshRes.data.accessToken;
          localStorage.setItem('accessToken', activeToken);
          if (refreshRes.data.refreshToken) {
            localStorage.setItem('refreshToken', refreshRes.data.refreshToken);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return rejectWithValue({ isAuthError: true, message: 'Session expired. Please log in again.' });
        }
      }

      const ghostOrgId = localStorage.getItem('rwm_ghost_org_id');
      const reqHeaders = { Authorization: `Bearer ${activeToken}` };
      if (ghostOrgId) {
        reqHeaders['x-impersonate-org-id'] = ghostOrgId;
        reqHeaders['x-ghost-org-id'] = ghostOrgId;
      }

      const response = await axios.get('/api/auth/me', {
        headers: reqHeaders,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue({ isAuthError: true, message: 'Session expired. Please log in again.' });
      }
      return rejectWithValue({ isAuthError: false, message: error.response?.data?.message || 'Server connection issue' });
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    organization: (() => {
      try {
        const ghost = localStorage.getItem('rwm_ghost_org_data');
        if (ghost) return JSON.parse(ghost);
        const userOrg = localStorage.getItem('rwm_user_org');
        if (userOrg) return JSON.parse(userOrg);
        return null;
      } catch {
        return null;
      }
    })(),
    accessToken: localStorage.getItem('accessToken') || null,
    activeWorkspace: localStorage.getItem('activeWorkspace') || null,
    ghostMode: Boolean(localStorage.getItem('rwm_ghost_org_id')),
    ghostOrg: (() => {
      try {
        const d = localStorage.getItem('rwm_ghost_org_data');
        return d ? JSON.parse(d) : null;
      } catch {
        return null;
      }
    })(),
    loading: false,
    authChecked: false,
    error: null,
    isAuthenticated: Boolean(
      localStorage.getItem('accessToken') &&
      localStorage.getItem('refreshToken') &&
      !isTokenExpired(localStorage.getItem('refreshToken'))
    ),
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.organization = null;
      state.accessToken = null;
      state.activeWorkspace = null;
      state.ghostMode = false;
      state.ghostOrg = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.authChecked = true;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('activeWorkspace');
      localStorage.removeItem('rwm_ghost_org_id');
      localStorage.removeItem('rwm_ghost_org_data');
      localStorage.removeItem('rwm_user_org');
    },
    enterGhostMode: (state, action) => {
      const org = action.payload;
      state.ghostMode = true;
      state.ghostOrg = org;
      state.organization = org;
      localStorage.setItem('rwm_ghost_org_id', org._id);
      localStorage.setItem('rwm_ghost_org_data', JSON.stringify(org));
    },
    exitGhostMode: (state) => {
      state.ghostMode = false;
      state.ghostOrg = null;
      state.organization = null;
      localStorage.removeItem('rwm_ghost_org_id');
      localStorage.removeItem('rwm_ghost_org_data');
      localStorage.removeItem('activeWorkspace');
    },
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.organization = action.payload.organization || state.organization || null;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.authChecked = true;
      state.error = null;
    },
    updateCurrentUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setActiveWorkspace: (state, action) => {
      state.activeWorkspace = action.payload;
      if (action.payload) {
        localStorage.setItem('activeWorkspace', action.payload);
      } else {
        localStorage.removeItem('activeWorkspace');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Login ──
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.organization = action.payload.organization || null;
        if (action.payload.organization) {
          try {
            localStorage.setItem('rwm_user_org', JSON.stringify(action.payload.organization));
          } catch {}
        }
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.authChecked = true;
        state.error = action.payload?.message || 'Login failed';
      })
      // ── Fetch Me ──
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.organization = action.payload.organization || null;
        if (action.payload.organization && !action.payload.isGhostMode) {
          try {
            localStorage.setItem('rwm_user_org', JSON.stringify(action.payload.organization));
          } catch {}
        }
        if (action.payload.isGhostMode && action.payload.organization) {
          state.ghostMode = true;
          state.ghostOrg = action.payload.organization;
        }
        state.isAuthenticated = true;
        state.authChecked = true;
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.authChecked = true;
        if (action.payload?.isAuthError) {
          state.user = null;
          state.organization = null;
          state.accessToken = null;
          state.isAuthenticated = false;
          state.error = action.payload?.message || 'Session expired';
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('rwm_user_org');
        } else {
          state.error = action.payload?.message || 'Temporary connection issue';
        }
      });
  },
});

export const {
  logout,
  setAuth,
  updateCurrentUser,
  setActiveWorkspace,
  clearError,
  enterGhostMode,
  exitGhostMode,
} = authSlice.actions;
export default authSlice.reducer;

