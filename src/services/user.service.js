import httpClient from "./http.client";

/**
 * User Service
 * Handles personal dashboard and user-specific activity data
 */
class UserService {
	/**
	 * Get User Dashboard Data
	 * @returns {Promise<Object>}
	 */
	async getDashboardData() {
		try {
			const response = await httpClient.get("/user/dashboard");
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
}

export default new UserService();
