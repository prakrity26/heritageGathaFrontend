/**
 * Frontend API Request Logger
 * Intercepts and logs all API requests from frontend to backend
 *
 * Features:
 * - Request/response logging
 * - Error tracking
 * - Performance metrics
 * - LocalStorage persistence
 * - Console visualization
 */

class FrontendAPILogger {
	constructor() {
		this.logs = [];
		this.maxLogs = 500; // Store max 500 logs in memory
		this.storageKey = "heritagegatha_api_logs";

		// Load existing logs from localStorage
		this.loadLogsFromStorage();
	}

	/**
	 * Log an API request
	 * @param {Object} config - Request configuration
	 * @param {string} config.url - Request URL
	 * @param {string} config.method - HTTP method
	 * @param {Object} config.headers - Request headers
	 * @param {Object} config.body - Request body
	 */
	logRequest(config) {
		const entry = {
			id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			type: "request",
			timestamp: new Date().toISOString(),
			url: config.url,
			method: config.method || "GET",
			headers: this.sanitizeHeaders(config.headers),
			bodyPreview: config.body
				? JSON.stringify(config.body).substring(0, 100)
				: null,
		};

		this.addLog(entry);
		this.logToConsole(entry);

		return entry.id;
	}

	/**
	 * Log an API response
	 * @param {Object} config - Response configuration
	 * @param {string} config.requestId - Associated request ID
	 * @param {number} config.status - HTTP status code
	 * @param {Object} config.data - Response data
	 * @param {number} config.duration - Response time in ms
	 */
	logResponse(config) {
		const entry = {
			id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			type: "response",
			timestamp: new Date().toISOString(),
			requestId: config.requestId,
			status: config.status,
			statusText: config.statusText || "",
			dataPreview: config.data
				? JSON.stringify(config.data).substring(0, 100)
				: null,
			duration: `${config.duration}ms`,
			success: config.status >= 200 && config.status < 300,
		};

		this.addLog(entry);
		this.logToConsole(entry);

		return entry.id;
	}

	/**
	 * Log an API error
	 * @param {Object} config - Error configuration
	 * @param {string} config.requestId - Associated request ID
	 * @param {string} config.url - Request URL
	 * @param {Error} config.error - Error object
	 * @param {number} config.duration - Request duration in ms
	 */
	logError(config) {
		const entry = {
			id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			type: "error",
			timestamp: new Date().toISOString(),
			requestId: config.requestId,
			url: config.url,
			method: config.method || "GET",
			error: {
				message: config.error?.message || "Unknown error",
				name: config.error?.name || "Error",
			},
			duration: `${config.duration}ms`,
		};

		this.addLog(entry);
		this.logToConsole(entry);

		return entry.id;
	}

	/**
	 * Add log entry
	 * @private
	 */
	addLog(entry) {
		this.logs.push(entry);

		// Keep only latest entries
		if (this.logs.length > this.maxLogs) {
			this.logs = this.logs.slice(-this.maxLogs);
		}

		// Save to localStorage
		this.saveLogsToStorage();
	}

	/**
	 * Get all logs
	 * @returns {Array} - Array of log entries
	 */
	getLogs() {
		return this.logs;
	}

	/**
	 * Get logs by type
	 * @param {string} type - 'request', 'response', or 'error'
	 * @returns {Array} - Filtered logs
	 */
	getLogsByType(type) {
		return this.logs.filter((log) => log.type === type);
	}

	/**
	 * Get logs for a specific URL
	 * @param {string} url - URL pattern to match
	 * @returns {Array} - Filtered logs
	 */
	getLogsByUrl(url) {
		return this.logs.filter(
			(log) => log.url?.includes(url) || log.requestId,
		);
	}

	/**
	 * Clear all logs
	 */
	clearLogs() {
		this.logs = [];
		localStorage.removeItem(this.storageKey);
		console.log("📋 All API logs cleared");
	}

	/**
	 * Get statistics
	 * @returns {Object} - Statistics object
	 */
	getStats() {
		const stats = {
			total: this.logs.length,
			requests: this.getLogsByType("request").length,
			responses: this.getLogsByType("response").length,
			errors: this.getLogsByType("error").length,
			successRate: "N/A",
		};

		const responses = this.getLogsByType("response");
		if (responses.length > 0) {
			const successful = responses.filter((r) => r.success).length;
			stats.successRate = `${Math.round((successful / responses.length) * 100)}%`;
		}

		return stats;
	}

	/**
	 * Save logs to localStorage
	 * @private
	 */
	saveLogsToStorage() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
		} catch (error) {
			// Storage quota exceeded - clear old logs
			if (error.name === "QuotaExceededError") {
				this.logs = this.logs.slice(-100);
				try {
					localStorage.setItem(
						this.storageKey,
						JSON.stringify(this.logs),
					);
				} catch (e) {
					console.warn("⚠️  Could not save API logs to localStorage");
				}
			}
		}
	}

	/**
	 * Load logs from localStorage
	 * @private
	 */
	loadLogsFromStorage() {
		try {
			const stored = localStorage.getItem(this.storageKey);
			if (stored) {
				this.logs = JSON.parse(stored);
			}
		} catch (error) {
			console.warn("⚠️  Could not load API logs from localStorage");
		}
	}

	/**
	 * Sanitize headers to remove sensitive data
	 * @private
	 */
	sanitizeHeaders(headers) {
		if (!headers) return {};

		const sanitized = { ...headers };
		const sensitiveHeaders = ["authorization", "x-api-key", "auth"];

		sensitiveHeaders.forEach((header) => {
			if (sanitized[header]) {
				sanitized[header] = "***REDACTED***";
			}
		});

		return sanitized;
	}

	/**
	 * Log to browser console
	 * @private
	 */
	logToConsole(entry) {
		const style = {
			request: "color: #3498db; font-weight: bold;",
			response: "color: #2ecc71; font-weight: bold;",
			error: "color: #e74c3c; font-weight: bold;",
		};

		const typeStyle = style[entry.type] || "";

		console.log(`%c[${entry.type.toUpperCase()}]`, typeStyle, {
			timestamp: entry.timestamp,
			...entry,
		});
	}

	/**
	 * Generate and display logs summary
	 */
	displaySummary() {
		const stats = this.getStats();
		console.log(`
╔════════════════════════════════════════════════════════════════╗
║               🌐 FRONTEND API LOGS SUMMARY                     ║
╠════════════════════════════════════════════════════════════════╣
║ Total Logs:       ${String(stats.total).padEnd(40)}║
║ Requests:        ${String(stats.requests).padEnd(40)}║
║ Responses:       ${String(stats.responses).padEnd(40)}║
║ Errors:          ${String(stats.errors).padEnd(40)}║
║ Success Rate:    ${String(stats.successRate).padEnd(40)}║
╚════════════════════════════════════════════════════════════════╝
		`);
	}

	/**
	 * Export logs as JSON
	 * @returns {string} - JSON string
	 */
	exportAsJSON() {
		return JSON.stringify(this.logs, null, 2);
	}

	/**
	 * Export logs as CSV
	 * @returns {string} - CSV string
	 */
	exportAsCSV() {
		if (this.logs.length === 0) {
			return "No logs to export";
		}

		const headers = [
			"Timestamp",
			"Type",
			"Method",
			"URL",
			"Status",
			"Duration",
		];
		const rows = this.logs.map((log) => [
			log.timestamp,
			log.type,
			log.method || "-",
			log.url || "-",
			log.status || "-",
			log.duration || "-",
		]);

		const csv = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		return csv;
	}
}

// Create and export singleton instance
const apiLogger = new FrontendAPILogger();

// Make it available globally for debugging
if (typeof window !== "undefined") {
	window.__apiLogger = apiLogger;
	console.log("📋 API Logger available at window.__apiLogger");
}

export default apiLogger;
