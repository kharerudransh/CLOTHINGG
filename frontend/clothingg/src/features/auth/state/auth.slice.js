import { createSlice } from "@reduxjs/toolkit";

/* ── persist helpers ── */
const STORAGE_KEY = "clothingg_user";

const loadUser = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const saveUser = (user) => {
    try {
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        else localStorage.removeItem(STORAGE_KEY);
    } catch { /* storage full / private mode — fail silently */ }
};

/* ── slice ── */
const authSlice = createSlice({
    name: "auth-slice",
    initialState: {
        user: loadUser(),   // ← rehydrates from localStorage on every reload
        loading: true,
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            saveUser(action.payload);   // persist on login / verify
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
            state.error = null;
            saveUser(null);             // clear on logout
        },
    }
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;