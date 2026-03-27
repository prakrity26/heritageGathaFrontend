import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	language: localStorage.getItem("audioLanguage") || "en",
};

const languageSlice = createSlice({
	name: "language",
	initialState,
	reducers: {
		setLanguage: (state, action) => {
			state.language = action.payload;
			localStorage.setItem("audioLanguage", action.payload);
		},
	},
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
