import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	isLoggedIn: localStorage.getItem("isLoggedIn") === "true" || false,
	user: localStorage.getItem("user")
		? JSON.parse(localStorage.getItem("user"))
		: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		login: (state, action) => {
			state.isLoggedIn = true;
			state.user = action.payload;
			localStorage.setItem("isLoggedIn", "true");
			localStorage.setItem("user", JSON.stringify(action.payload));
		},
		logout: (state) => {
			state.isLoggedIn = false;
			state.user = null;
			localStorage.setItem("isLoggedIn", "false");
			localStorage.removeItem("user");
		},
	},
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
