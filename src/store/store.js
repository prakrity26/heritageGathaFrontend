import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import languageReducer from "./languageSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		language: languageReducer,
	},
});
