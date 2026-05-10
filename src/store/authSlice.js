import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	isLoggedIn: localStorage.getItem("isLoggedIn") === "true" || false,
	user: localStorage.getItem("user")
		? JSON.parse(localStorage.getItem("user"))
		: null,
	loading: false,
	error: null,
	successMessage: null,
	accessToken: localStorage.getItem("accessToken") || null,
	refreshToken: localStorage.getItem("refreshToken") || null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		// Login
		loginStart: (state) => {
			state.loading = true;
			state.error = null;
			state.successMessage = null;
		},
		loginSuccess: (state, action) => {
			state.isLoggedIn = true;
			state.user = action.payload.user;
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.loading = false;
			state.error = null;
			state.successMessage = "Login successful!";

			// Persist to localStorage
			localStorage.setItem("isLoggedIn", "true");
			localStorage.setItem("user", JSON.stringify(action.payload.user));
			localStorage.setItem("accessToken", action.payload.accessToken);
			if (action.payload.refreshToken) {
				localStorage.setItem(
					"refreshToken",
					action.payload.refreshToken,
				);
			}
		},
		loginFailure: (state, action) => {
			state.loading = false;
			state.error = action.payload;
			state.successMessage = null;
		},

		// Register
		registerStart: (state) => {
			state.loading = true;
			state.error = null;
			state.successMessage = null;
		},
		registerSuccess: (state, action) => {
			state.loading = false;
			state.error = null;
			state.successMessage =
				action.payload.message ||
				"Registration successful! Check your email for OTP.";
		},
		registerFailure: (state, action) => {
			state.loading = false;
			state.error = action.payload;
			state.successMessage = null;
		},

		// OTP Verification
		verifyOTPStart: (state) => {
			state.loading = true;
			state.error = null;
			state.successMessage = null;
		},
		verifyOTPSuccess: (state, action) => {
			state.isLoggedIn = true;
			state.user = action.payload.user;
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.loading = false;
			state.error = null;
			state.successMessage = "Email verified successfully!";

			// Persist to localStorage
			localStorage.setItem("isLoggedIn", "true");
			localStorage.setItem("user", JSON.stringify(action.payload.user));
			localStorage.setItem("accessToken", action.payload.accessToken);
			if (action.payload.refreshToken) {
				localStorage.setItem(
					"refreshToken",
					action.payload.refreshToken,
				);
			}
		},
		verifyOTPFailure: (state, action) => {
			state.loading = false;
			state.error = action.payload;
			state.successMessage = null;
		},

		// Logout
		logout: (state) => {
			state.isLoggedIn = false;
			state.user = null;
			state.accessToken = null;
			state.refreshToken = null;
			state.loading = false;
			state.error = null;
			state.successMessage = null;

			// Clear localStorage
			localStorage.setItem("isLoggedIn", "false");
			localStorage.removeItem("user");
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
		},

		// Clear messages
		clearError: (state) => {
			state.error = null;
		},
		clearSuccess: (state) => {
			state.successMessage = null;
		},

		// Set access token
		setAccessToken: (state, action) => {
			state.accessToken = action.payload;
			localStorage.setItem("accessToken", action.payload);
		},

		// Set user (for /me endpoint)
		setUser: (state, action) => {
			state.user = action.payload;
			localStorage.setItem("user", JSON.stringify(action.payload));
		},
	},
});

export const {
	loginStart,
	loginSuccess,
	loginFailure,
	registerStart,
	registerSuccess,
	registerFailure,
	verifyOTPStart,
	verifyOTPSuccess,
	verifyOTPFailure,
	logout,
	clearError,
	clearSuccess,
	setAccessToken,
	setUser,
} = authSlice.actions;

export default authSlice.reducer;
