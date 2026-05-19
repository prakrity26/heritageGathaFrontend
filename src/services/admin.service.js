/**
 * Admin Service
 * Handles all admin-related API calls for Dashboard and Monument Management
 */

import httpClient from "./http.client";
import API_CONFIG from "./api.config";

class AdminService {
	/**
	 * Get Dashboard Statistics
	 * @returns {Promise<Object>} - Statistics response
	 */
	async getDashboardStats() {
		try {
			const response = await httpClient.get(
				API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD.STATS
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
			};
		}
	}

	/**
	 * Get Dashboard Recent Activity
	 * @returns {Promise<Object>} - Activity response
	 */
	async getDashboardActivity() {
		try {
			const response = await httpClient.get(
				API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD.ACTIVITY
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
			};
		}
	}

	/**
	 * Get all monuments (paginated, filtered)
	 * @param {number} page
	 * @param {number} limit
	 * @param {string} status
	 * @param {string} search
	 * @returns {Promise<Object>}
	 */
	async getMonuments(page = 1, limit = 25, status = "", search = "") {
		try {
			// Construct query params
			const params = new URLSearchParams({
				page,
				limit,
				...(status && status !== "all" && { status: status.toUpperCase() }),
				...(search && { search }),
			});

			const response = await httpClient.get(
				`${API_CONFIG.ENDPOINTS.ADMIN.MONUMENTS.LIST}?${params.toString()}`
			);
			return {
				success: true,
				data: response.data,
				pagination: response.pagination,
				message: response.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message,
				code: error.code,
			};
		}
	}

	/**
	 * Get monument by ID
	 * @param {string} id
	 * @returns {Promise<Object>}
	 */
	async getMonumentById(id) {
		try {
			const response = await httpClient.get(
				API_CONFIG.ENDPOINTS.ADMIN.MONUMENTS.DETAIL(id)
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
			};
		}
	}

	/**
	 * Create a new monument
	 * @param {Object} payload
	 * @returns {Promise<Object>}
	 */
	async createMonument(payload) {
		try {
			const response = await httpClient.post(
				API_CONFIG.ENDPOINTS.ADMIN.MONUMENTS.CREATE,
				payload
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
			};
		}
	}

	/**
	 * Update an existing monument
	 * @param {string} id
	 * @param {Object} payload
	 * @returns {Promise<Object>}
	 */
	async updateMonument(id, payload) {
		try {
			const response = await httpClient.put(
				API_CONFIG.ENDPOINTS.ADMIN.MONUMENTS.UPDATE(id),
				payload
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
			};
		}
	}

	/**
	 * Delete a monument
	 * @param {string} id
	 * @returns {Promise<Object>}
	 */
	async deleteMonument(id) {
		try {
			const response = await httpClient.delete(
				API_CONFIG.ENDPOINTS.ADMIN.MONUMENTS.DELETE(id)
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
			};
		}
	}

	/**
	 * Generate XTTS Audio
	 * @param {Object} payload { monumentId, text, languages }
	 * @returns {Promise<Object>}
	 */
	async generateAudio(payload) {
		try {
			const response = await httpClient.post(
				API_CONFIG.ENDPOINTS.ADMIN.AUDIO.GENERATE,
				payload
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
			};
		}
	}

	/**
	 * Standardized request handler
	 * @param {Promise} request - The HTTP request promise
	 * @param {string} context - Error context description
	 * @returns {Promise<Object>}
	 */
	async handleRequest(request, context) {
		try {
			const response = await request;
			return {
				success: true,
				data: response.data,
				pagination: response.pagination,
				message: response.message,
			};
		} catch (error) {
			console.error(`AdminService Error [${context}]:`, error);
			return {
				success: false,
				message: error.message || `Failed to ${context}`,
				code: error.code,
			};
		}
	}

	// =========================================================================
	// AUDIO MANAGEMENT
	// =========================================================================

	async getAudioJobs() {
		return await this.handleRequest(
			httpClient.get("/admin/audio/jobs"),
			"fetch audio jobs"
		);
	}

	async deleteAudioJob(id) {
		return await this.handleRequest(
			httpClient.delete(`/admin/audio/${id}`),
			"delete audio job"
		);
	}

	// =========================================================================
	// FEEDBACK & SETTINGS
	// =========================================================================

	async getFeedbackHub() {
		return await this.handleRequest(
			httpClient.get(API_CONFIG.ENDPOINTS.ADMIN.FEEDBACK.LIST),
			"fetch feedback hub"
		);
	}

	async deleteReview(reviewId) {
		return await this.handleRequest(
			httpClient.delete(`/admin/feedback/reviews/${reviewId}`),
			"delete review"
		);
	}

	async getSettings() {
		return await this.handleRequest(
			httpClient.get(API_CONFIG.ENDPOINTS.ADMIN.SETTINGS.GET),
			"fetch settings"
		);
	}

	async updateSettings(data) {
		return await this.handleRequest(
			httpClient.put(API_CONFIG.ENDPOINTS.ADMIN.SETTINGS.UPDATE, data),
			"update settings"
		);
	}
	/**
	 * Upload Monument Images (supports multiple)
	 * @param {string} monumentId 
	 * @param {File|File[]} files 
	 */
	async uploadMonumentImage(monumentId, files) {
		try {
			const formData = new FormData();
			const fileArray = Array.isArray(files) ? files : [files];
			
			fileArray.forEach(file => {
				formData.append("image", file);
			});

			const response = await httpClient.post(
				`/admin/monuments/${monumentId}/images`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
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
			};
		}
	}

	/**
	 * Delete Monument Image
	 * @param {string} imageId 
	 */
	async deleteMonumentImage(imageId) {
		try {
			const response = await httpClient.delete(
				`/admin/monuments/images/${imageId}`,
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
			};
		}
	}
}

export default new AdminService();
