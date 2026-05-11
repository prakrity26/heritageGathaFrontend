import apiLogger from "./apiLogger";

/**
 * Frontend API Fetch Interceptor
 * Automatically intercepts and logs all fetch requests
 *
 * Usage: Call initializeFetchInterceptor() on app startup
 */

let originalFetch = window.fetch;

/**
 * Initialize fetch interceptor
 * Call this once on app startup
 */
export function initializeFetchInterceptor() {
	window.fetch = function (...args) {
		const url = args[0];
		const options = args[1] || {};
		const startTime = Date.now();

		// Safely parse body for logging
		let parsedBody = null;
		if (options.body) {
			if (options.body instanceof FormData) {
				parsedBody = "[FormData]";
			} else if (typeof options.body === "string") {
				try {
					parsedBody = JSON.parse(options.body);
				} catch (e) {
					parsedBody = "[Non-JSON String Body]";
				}
			} else {
				parsedBody = "[Object Body]";
			}
		}

		// Log the request
		const requestId = apiLogger.logRequest({
			url: typeof url === "string" ? url : url.url,
			method: options.method || "GET",
			headers: options.headers,
			body: parsedBody,
		});

		// Call original fetch
		return originalFetch
			.apply(this, args)
			.then((response) => {
				const duration = Date.now() - startTime;
				const clonedResponse = response.clone();

				// Log the response
				apiLogger.logResponse({
					requestId,
					status: response.status,
					statusText: response.statusText,
					duration,
				});

				// Return original response
				return clonedResponse;
			})
			.catch((error) => {
				const duration = Date.now() - startTime;

				// Log the error
				apiLogger.logError({
					requestId,
					url: typeof url === "string" ? url : url.url,
					method: options.method || "GET",
					error,
					duration,
				});

				throw error;
			});
	};

	console.log(
		"✅ Fetch interceptor initialized - All API calls will be logged",
	);
}

/**
 * Display API logs in console
 */
export function showAPILogs() {
	const logs = apiLogger.getLogs();
	console.table(logs);
}

/**
 * Display API statistics
 */
export function showAPIStats() {
	apiLogger.displaySummary();
}

/**
 * Export API logs as file
 * @param {string} format - 'json' or 'csv'
 */
export function downloadAPILogs(format = "json") {
	const filename = `heritagegatha-api-logs-${new Date().toISOString().split("T")[0]}.${format}`;
	const content =
		format === "json" ? apiLogger.exportAsJSON() : apiLogger.exportAsCSV();
	const blob = new Blob([content], {
		type: format === "json" ? "application/json" : "text/csv",
	});
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
	console.log(`📥 Downloaded API logs as ${filename}`);
}

export default {
	initializeFetchInterceptor,
	showAPILogs,
	showAPIStats,
	downloadAPILogs,
};
