/**
 * HTTP Client
 * Centralized HTTP client for all API calls with built-in error handling,
 * request/response interceptors, and automatic token management
 */

import API_CONFIG, { DEFAULT_HEADERS, ERROR_MESSAGES } from "./api.config";

class HttpClient {
	constructor() {
		this.baseURL = API_CONFIG.BASE_URL;
		this.timeout = API_CONFIG.TIMEOUT;
		this.defaultHeaders = { ...DEFAULT_HEADERS };
		this.interceptors = {
			request: [],
			response: [],
			error: [],
		};
	}

	/**
	 * Execute HTTP request with retry logic
	 * @param {string} method - HTTP method (GET, POST, etc.)
	 * @param {string} url - Request URL
	 * @param {object} options - Request options (body, headers, etc.)
	 * @returns {Promise<Response>} - HTTP response
	 */
	async request(method, url, options = {}) {
		let attempt = 0;
		const maxAttempts = options.retryAttempts || API_CONFIG.RETRY_ATTEMPTS;

		while (attempt < maxAttempts) {
			try {
				// Apply request interceptors
				let finalOptions = { ...options };
				for (const interceptor of this.interceptors.request) {
					finalOptions = await interceptor(finalOptions);
				}

				// Prepare fetch options
				const fetchOptions = {
					method,
					headers: {
						...this.defaultHeaders,
						...finalOptions.headers,
					},
					credentials: "include", // For cookies (HttpOnly tokens)
					signal: this.getAbortSignal(),
				};

				// Add body for non-GET requests
				if (method !== "GET" && finalOptions.body) {
					fetchOptions.body =
						typeof finalOptions.body === "string"
							? finalOptions.body
							: JSON.stringify(finalOptions.body);
				}

				// Execute fetch
				const response = await fetch(
					`${this.baseURL}${url}`,
					fetchOptions,
				);

				// Apply response interceptors
				let finalResponse = response.clone();
				for (const interceptor of this.interceptors.response) {
					finalResponse = await interceptor(finalResponse);
				}

				return finalResponse;
			} catch (error) {
				// Apply error interceptors
				for (const interceptor of this.interceptors.error) {
					await interceptor(error);
				}

				attempt++;

				// Retry logic for network errors and 5xx status codes
				if (
					attempt < maxAttempts &&
					(this.isNetworkError(error) ||
						(error.response && error.response.status >= 500))
				) {
					// Exponential backoff
					await this.delay(
						API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1),
					);
					continue;
				}

				throw error;
			}
		}
	}

	/**
	 * GET request
	 * @param {string} url - Request URL
	 * @param {object} options - Request options
	 * @returns {Promise<*>} - Parsed response data
	 */
	async get(url, options = {}) {
		const response = await this.request("GET", url, options);
		return this.parseResponse(response);
	}

	/**
	 * POST request
	 * @param {string} url - Request URL
	 * @param {*} body - Request body
	 * @param {object} options - Request options
	 * @returns {Promise<*>} - Parsed response data
	 */
	async post(url, body, options = {}) {
		const response = await this.request("POST", url, {
			...options,
			body,
		});
		return this.parseResponse(response);
	}

	/**
	 * PUT request
	 * @param {string} url - Request URL
	 * @param {*} body - Request body
	 * @param {object} options - Request options
	 * @returns {Promise<*>} - Parsed response data
	 */
	async put(url, body, options = {}) {
		const response = await this.request("PUT", url, {
			...options,
			body,
		});
		return this.parseResponse(response);
	}

	/**
	 * DELETE request
	 * @param {string} url - Request URL
	 * @param {object} options - Request options
	 * @returns {Promise<*>} - Parsed response data
	 */
	async delete(url, options = {}) {
		const response = await this.request("DELETE", url, options);
		return this.parseResponse(response);
	}

	/**
	 * PATCH request
	 * @param {string} url - Request URL
	 * @param {*} body - Request body
	 * @param {object} options - Request options
	 * @returns {Promise<*>} - Parsed response data
	 */
	async patch(url, body, options = {}) {
		const response = await this.request("PATCH", url, {
			...options,
			body,
		});
		return this.parseResponse(response);
	}

	/**
	 * Parse API response and handle errors
	 * @param {Response} response - Fetch response
	 * @returns {Promise<*>} - Parsed data
	 * @throws {ApiError} - Throws API error with context
	 */
	async parseResponse(response) {
		const contentType = response.headers.get("content-type");
		let data;

		// Parse response body
		if (contentType && contentType.includes("application/json")) {
			data = await response.json();
		} else {
			data = await response.text();
		}

		// Handle non-2xx status codes
		if (!response.ok) {
			throw this.createError(response.status, data);
		}

		return data;
	}

	/**
	 * Create standardized API error
	 * @param {number} status - HTTP status code
	 * @param {*} data - Response data
	 * @returns {Error} - Error object
	 */
	createError(status, data) {
		const error = new Error();
		error.status = status;
		error.response = data;

		// Map status code to error message
		switch (status) {
			case 400:
				error.message =
					data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
				error.code = "VALIDATION_ERROR";
				error.details = data?.errors;
				break;
			case 401:
				error.message = ERROR_MESSAGES.UNAUTHORIZED;
				error.code = "UNAUTHORIZED";
				break;
			case 403:
				error.message = ERROR_MESSAGES.FORBIDDEN;
				error.code = "FORBIDDEN";
				break;
			case 404:
				error.message = ERROR_MESSAGES.NOT_FOUND;
				error.code = "NOT_FOUND";
				break;
			case 409:
				error.message = data?.message || "Resource conflict";
				error.code = "CONFLICT";
				break;
			case 429:
				error.message = "Too many requests. Please try again later.";
				error.code = "RATE_LIMIT_EXCEEDED";
				break;
			case 500:
			case 502:
			case 503:
				error.message = data?.message || ERROR_MESSAGES.SERVER_ERROR;
				error.code = "SERVER_ERROR";
				break;
			default:
				error.message = data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
				error.code = "UNKNOWN_ERROR";
		}

		return error;
	}

	/**
	 * Set authorization header with token
	 * @param {string} token - Bearer token
	 */
	setAuthorizationHeader(token) {
		if (token) {
			this.defaultHeaders = {
				...DEFAULT_HEADERS,
				Authorization: token,
			};
		}
	}

	/**
	 * Clear authorization header
	 */
	clearAuthorizationHeader() {
		this.defaultHeaders = { ...DEFAULT_HEADERS };
	}

	/**
	 * Add request interceptor
	 * @param {Function} interceptor - Interceptor function
	 */
	addRequestInterceptor(interceptor) {
		this.interceptors.request.push(interceptor);
	}

	/**
	 * Add response interceptor
	 * @param {Function} interceptor - Interceptor function
	 */
	addResponseInterceptor(interceptor) {
		this.interceptors.response.push(interceptor);
	}

	/**
	 * Add error interceptor
	 * @param {Function} interceptor - Interceptor function
	 */
	addErrorInterceptor(interceptor) {
		this.interceptors.error.push(interceptor);
	}

	/**
	 * Check if error is network-related
	 * @param {Error} error - Error object
	 * @returns {boolean}
	 */
	isNetworkError(error) {
		return (
			error instanceof TypeError ||
			error.message === "Failed to fetch" ||
			error.name === "AbortError"
		);
	}

	/**
	 * Get abort signal for request timeout
	 * @returns {AbortSignal}
	 */
	getAbortSignal() {
		const controller = new AbortController();
		setTimeout(() => controller.abort(), this.timeout);
		return controller.signal;
	}

	/**
	 * Utility delay function
	 * @param {number} ms - Milliseconds to delay
	 * @returns {Promise}
	 */
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Export singleton instance
export default new HttpClient();
