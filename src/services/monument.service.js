import API_CONFIG, { ERROR_MESSAGES } from "./api.config";
import httpClient from "./http.client";

class MonumentService {
	/**
	 * Generic error handler for monument service
	 */
	handleError(error, defaultMessage) {
		console.error(`MonumentService Error:`, error);
		if (error.status === 401) {
			return { success: false, message: "Session expired. Please login again." };
		}
		if (error.response?.message) {
			return { success: false, message: error.response.message };
		}
		if (error.code === "ECONNABORTED") {
			return { success: false, message: ERROR_MESSAGES.TIMEOUT_ERROR };
		}
		if (!navigator.onLine) {
			return { success: false, message: ERROR_MESSAGES.NETWORK_ERROR };
		}
		return { success: false, message: defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR };
	}

	async getAllMonuments(params = {}) {
		try {
			const res = await httpClient.get("/monuments", { params });
			// The backend SuccessResponse puts the main data (monuments array) in res.data
			// and pagination in res.pagination
			return { success: true, data: res.data, pagination: res.pagination };
		} catch (error) {
			return this.handleError(error, "Failed to fetch monuments");
		}
	}

	async getMonumentById(id) {
		try {
			const res = await httpClient.get(API_CONFIG.ENDPOINTS.MONUMENTS.DETAIL(id));
			return { success: true, data: res.data };
		} catch (error) {
			return this.handleError(error, "Failed to fetch monument");
		}
	}

	async getNearbyMonuments(latitude, longitude, radius = 10) {
		try {
			const res = await httpClient.get("/monuments/nearby", {
				params: { latitude, longitude, radius }
			});
			return { success: true, data: res.data };
		} catch (error) {
			return this.handleError(error, "Failed to fetch nearby monuments");
		}
	}

	async submitFeedback(monumentId, payload) {
		try {
			const res = await httpClient.post(
				API_CONFIG.ENDPOINTS.MONUMENTS.SUBMIT_REVIEW(monumentId),
				payload
			);
			return { success: true, data: res.data };
		} catch (error) {
			return this.handleError(error, "Failed to submit feedback");
		}
	}

	async getMonumentReviews(id, page = 1, limit = 10) {
		try {
			const res = await httpClient.get(API_CONFIG.ENDPOINTS.MONUMENTS.REVIEWS(id), {
				params: { page, limit }
			});
			return { success: true, data: res.data };
		} catch (error) {
			return this.handleError(error, "Failed to fetch monument reviews");
		}
	}
}

export default new MonumentService();
