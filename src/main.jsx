import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { initializeFetchInterceptor } from "./utils/fetchInterceptor";
import "./index.css";
import App from "./App.jsx";

// Initialize API logging on app startup
initializeFetchInterceptor();

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</StrictMode>,
);
