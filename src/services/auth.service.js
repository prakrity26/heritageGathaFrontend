/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Manages tokens, OTP verification, and user session
 */

import httpClient from "./http.client";
import API_CONFIG from "./api.config";

class AuthService {
	/**
	 * Register new user
	 * @param {Object} payload - Registration data
	 * @param {string} payload.full_name - User's full name
	 * @param {string} payload.email - User's email
	 * @param {string} payload.password - User's password
	 * @param {string} payload.nationality - User's nationality (optional)
	 * @returns {Promise<Object>} - Registration response with user data
	 */
	async register(payload) {
		try {
			const response = await httpClient.post(
				API_CONFIG.ENDPOINTS.AUTH.REGISTER,
				{
					full_name: payload.full_name,
					email: payload.email,
					password: payload.password,
					nationality: payload.nationality || null,
				},
			);

			return {
				success: true,
				data: response.data,
				message: response.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
				code: error.code,
				details: error.details,
			};
		}
	}

	/**
	 * Verify user email via OTP
	 * @param {string} email - User's email
	 * @param {string} otp - 6-digit OTP code
	 * @returns {Promise<Object>} - Verification response with tokens
	 */
	async verifyOTP(email, otp) {
		try {
			const response = await httpClient.post(
				API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
				{
					email,
					otp,
				},
			);

			// Store tokens from response
			if (response.data?.accessToken) {
				localStorage.setItem("accessToken", response.data.accessToken);
			}
			if (response.data?.refreshToken) {
				localStorage.setItem(
					"refreshToken",
					response.data.refreshToken,
				);
			}

			return {
				success: true,
				data: response.data,
				message: response.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
				code: error.code,
				details: error.details,
			};
		}
	}

	/**
	 * Resend OTP to user email
	 * @param {string} email - User's email
	 * @returns {Promise<Object>} - Resend response
	 */
	async resendOTP(email) {
		try {
			const response = await httpClient.post(
				API_CONFIG.ENDPOINTS.AUTH.RESEND_OTP,
				{
					email,
				},
			);

			return {
				success: true,
				data: response.data,
				message: response.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
				code: error.code,
				details: error.details,
			};
		}
	}

	/**
	 * Login user with email and password
	 * @param {string} email - User's email
	 * @param {string} password - User's password
	 * @returns {Promise<Object>} - Login response with tokens and user data
	 */
	async login(email, password) {
		try {
			const response = await httpClient.post(
				API_CONFIG.ENDPOINTS.AUTH.LOGIN,
				{
					email,
					password,
				},
			);

			// Store tokens from response
			if (response.data?.accessToken) {
				localStorage.setItem("accessToken", response.data.accessToken);
			}
			if (response.data?.refreshToken) {
				localStorage.setItem(
					"refreshToken",
					response.data.refreshToken,
				);
			}

			return {
				success: true,
				data: response.data,
				message: response.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
				code: error.code,
				details: error.details,
			};
		}
	}

	/**
	 * Refresh access token using refresh token
	 * @returns {Promise<Object>} - New access token or error
	 */
	async refreshToken() {
		try {
			const refreshToken = localStorage.getItem("refreshToken");

			if (!refreshToken) {
				throw new Error("No refresh token available");
			}

			const response = await httpClient.post(
				API_CONFIG.ENDPOINTS.AUTH.REFRESH,
				{
					refreshToken,
				},
			);

			// Update access token
			if (response.data?.accessToken) {
				localStorage.setItem("accessToken", response.data.accessToken);
			}

			return {
				success: true,
				data: response.data,
				message: response.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
				code: error.code,
				details: error.details,
			};
		}
	}

	/**
	 * Logout user
	 * @returns {Promise<Object>} - Logout response
	 */
	async logout() {
		try {
			// Call logout endpoint (requires authentication)
			const response = await httpClient.post(
				API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
				{},
			);

			// Clear stored tokens
			this.clearTokens();

			return {
				success: true,
				data: response.data,
				message: response.message,
			};
		} catch (error) {
			// Even if logout fails, clear local tokens
			this.clearTokens();

			return {
				success: false,
				message: error.message,
				code: error.code,
				details: error.details,
			};
		}
	}

	/**
	 * Get current user profile
	 * @returns {Promise<Object>} - User profile data
	 */
	async getCurrentUser() {
		try {
			const response = await httpClient.get(API_CONFIG.ENDPOINTS.AUTH.ME);

			return {
				success: true,
				data: response.data,
				message: response.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
				code: error.code,
				details: error.details,
			};
		}
	}

	/**
	 * Get access token from storage
	 * @returns {string|null} - Access token or null
	 */
	getAccessToken() {
		return localStorage.getItem("accessToken");
	}

	/**
	 * Get refresh token from storage
	 * @returns {string|null} - Refresh token or null
	 */
	getRefreshToken() {
		return localStorage.getItem("refreshToken");
	}

	/**
	 * Check if user is authenticated
	 * @returns {boolean}
	 */
	isAuthenticated() {
		return !!this.getAccessToken();
	}

	/**
	 * Clear all stored tokens
	 */
	clearTokens() {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("user");
		localStorage.removeItem("isLoggedIn");
	}

	/**
	 * Set authorization header with token
	 * @param {string} token - Access token
	 */
	setAuthHeader(token) {
		if (token) {
			httpClient.setAuthorizationHeader(`Bearer ${token}`);
		}
	}
}

// Export singleton instance
export default new AuthService();
