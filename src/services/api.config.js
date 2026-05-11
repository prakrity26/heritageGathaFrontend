/**
 * API Configuration
 * Centralized configuration for all API calls
 * Environment-specific base URLs and default settings
 */

// Get base URL from environment or use default
const getApiBaseUrl = () => {
	if (typeof window !== "undefined" && window.env?.REACT_APP_API_URL) {
		return window.env.REACT_APP_API_URL;
	}
	return import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

/**
 * API Configuration object with all endpoints
 */
export const API_CONFIG = {
	BASE_URL: API_BASE_URL,
	TIMEOUT: 30000, // 30 seconds
	RETRY_ATTEMPTS: 3,
	RETRY_DELAY: 1000, // milliseconds

	// API Endpoints
	ENDPOINTS: {
		// Authentication
		AUTH: {
			REGISTER: "/auth/register",
			LOGIN: "/auth/login",
			VERIFY_OTP: "/auth/verify-otp",
			RESEND_OTP: "/auth/resend-otp",
			REFRESH: "/auth/refresh",
			LOGOUT: "/auth/logout",
			ME: "/auth/me",
		},

		// Monuments
		MONUMENTS: {
			LIST: "/monuments",
			DETAIL: (id) => `/monuments/${id}`,
			REVIEWS: (id) => `/monuments/${id}/reviews`,
			SUBMIT_REVIEW: (id) => `/monuments/${id}/reviews`,
		},

		// Vision/AI
		VISION: {
			ANALYZE: "/vision/analyze",
		},

		// Admin
		ADMIN: {
			MONUMENTS: {
				LIST: "/admin/monuments",
				DETAIL: (id) => `/admin/monuments/${id}`,
				CREATE: "/admin/monuments",
				UPDATE: (id) => `/admin/monuments/${id}`,
				DELETE: (id) => `/admin/monuments/${id}`,
			},
			AUDIO: {
				GENERATE: "/admin/audio/generate",
			},
			DASHBOARD: {
				STATS: "/admin/dashboard/stats",
				ACTIVITY: "/admin/dashboard/recent-scans",
			},
			FEEDBACK: {
				LIST: "/admin/feedback",
			},
			SETTINGS: {
				GET: "/admin/settings",
				UPDATE: "/admin/settings",
			}
		},
	},
};

/**
 * HTTP Headers configuration
 */
export const DEFAULT_HEADERS = {
	"Content-Type": "application/json",
	Accept: "application/json",
};

/**
 * Error messages mapping
 */
export const ERROR_MESSAGES = {
	NETWORK_ERROR: "Network error. Please check your connection and try again.",
	TIMEOUT_ERROR: "Request timeout. Please try again.",
	SERVER_ERROR: "Server error. Please try again later.",
	UNAUTHORIZED: "Session expired. Please login again.",
	FORBIDDEN: "You don't have permission to access this resource.",
	NOT_FOUND: "Resource not found.",
	VALIDATION_ERROR: "Please check your input and try again.",
	UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};

export default API_CONFIG;
