import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api.config";
import apiLogger from "../utils/apiLogger";

/**
 * Admin Monitoring Dashboard
 * Displays API logs and mail queue status for system monitoring
 */
export default function MonitoringDashboard() {
	const [activeTab, setActiveTab] = useState("api-logs");
	const [apiLogs, setApiLogs] = useState([]);
	const [mailQueue, setMailQueue] = useState(null);
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Fetch backend API logs
	const fetchBackendLogs = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				API_ENDPOINTS.AUTH.GET_ME.replace("/me", "/monitoring/logs"),
			);
			const data = await response.json();

			if (data.status === "success") {
				setApiLogs(data.data.logs || []);
				setStats(data.data.stats);
			}
		} catch (err) {
			setError(`Failed to fetch backend logs: ${err.message}`);
		}
		setLoading(false);
	};

	// Fetch mail queue status
	const fetchMailQueue = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				API_ENDPOINTS.AUTH.GET_ME.replace(
					"/me",
					"/monitoring/mail-queue",
				),
			);
			const data = await response.json();

			if (data.status === "success") {
				setMailQueue(data.data);
			}
		} catch (err) {
			setError(`Failed to fetch mail queue: ${err.message}`);
		}
		setLoading(false);
	};

	// Fetch queue visualization
	const fetchQueueVisualization = async () => {
		try {
			const response = await fetch(
				API_ENDPOINTS.AUTH.GET_ME.replace(
					"/me",
					"/monitoring/queue-visualization",
				),
			);
			const text = await response.text();
			console.log("Mail Queue Visualization:\n" + text);
			alert("Check console for mail queue visualization (Ctrl+Shift+K)");
		} catch (err) {
			setError(`Failed to fetch visualization: ${err.message}`);
		}
	};

	useEffect(() => {
		if (activeTab === "api-logs") {
			fetchBackendLogs();
		} else if (activeTab === "mail-queue") {
			fetchMailQueue();
		}

		// Auto-refresh every 10 seconds
		const interval = setInterval(() => {
			if (activeTab === "api-logs") {
				fetchBackendLogs();
			} else if (activeTab === "mail-queue") {
				fetchMailQueue();
			}
		}, 10000);

		return () => clearInterval(interval);
	}, [activeTab]);

	const handleDownloadLogs = () => {
		const dataStr = JSON.stringify(apiLogs, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `backend-api-logs-${new Date().toISOString().split("T")[0]}.json`;
		link.click();
	};

	const handleShowFrontendLogs = () => {
		const frontendLogs = apiLogger.getLogs();
		console.table(frontendLogs);
		apiLogger.displaySummary();
		alert("Frontend logs displayed in console");
	};

	return (
		<div className="max-w-6xl mx-auto p-6 bg-surface-container rounded-lg">
			<h1 className="text-3xl font-bold text-on-surface mb-6">
				📊 System Monitoring Dashboard
			</h1>

			{error && (
				<div className="bg-error/10 border border-error text-on-error-container p-4 rounded-lg mb-4">
					{error}
				</div>
			)}

			{/* Tab Navigation */}
			<div className="flex gap-4 mb-6 border-b border-outline">
				<button
					onClick={() => setActiveTab("api-logs")}
					className={`px-4 py-2 font-semibold transition-colors ${
						activeTab === "api-logs"
							? "border-b-2 border-primary text-primary"
							: "text-on-surface-variant hover:text-on-surface"
					}`}
				>
					📡 Backend API Logs
				</button>
				<button
					onClick={() => setActiveTab("mail-queue")}
					className={`px-4 py-2 font-semibold transition-colors ${
						activeTab === "mail-queue"
							? "border-b-2 border-primary text-primary"
							: "text-on-surface-variant hover:text-on-surface"
					}`}
				>
					📧 Mail Queue
				</button>
				<button
					onClick={() => setActiveTab("frontend-logs")}
					className={`px-4 py-2 font-semibold transition-colors ${
						activeTab === "frontend-logs"
							? "border-b-2 border-primary text-primary"
							: "text-on-surface-variant hover:text-on-surface"
					}`}
				>
					🌐 Frontend Logs
				</button>
			</div>

			{/* Backend API Logs Tab */}
			{activeTab === "api-logs" && (
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold text-on-surface">
							Backend API Request Logs
						</h2>
						<button
							onClick={fetchBackendLogs}
							disabled={loading}
							className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/80 disabled:opacity-50"
						>
							{loading ? "Refreshing..." : "🔄 Refresh"}
						</button>
					</div>

					{stats && (
						<div className="grid grid-cols-4 gap-4">
							<div className="bg-primary/10 p-4 rounded-lg">
								<div className="text-sm text-on-surface-variant">
									Total Requests
								</div>
								<div className="text-2xl font-bold text-primary">
									{stats.totalRequests}
								</div>
							</div>
							<div className="bg-secondary/10 p-4 rounded-lg">
								<div className="text-sm text-on-surface-variant">
									Successful
								</div>
								<div className="text-2xl font-bold text-secondary">
									{stats.successfulRequests}
								</div>
							</div>
							<div className="bg-tertiary/10 p-4 rounded-lg">
								<div className="text-sm text-on-surface-variant">
									Failed
								</div>
								<div className="text-2xl font-bold text-tertiary">
									{stats.failedRequests}
								</div>
							</div>
							<div className="bg-outline/10 p-4 rounded-lg">
								<div className="text-sm text-on-surface-variant">
									Avg Duration
								</div>
								<div className="text-2xl font-bold">
									{stats.avgDuration}ms
								</div>
							</div>
						</div>
					)}

					<button
						onClick={handleDownloadLogs}
						className="px-4 py-2 bg-secondary text-on-secondary rounded-lg hover:bg-secondary/80"
					>
						📥 Download Backend Logs
					</button>

					<div className="max-h-96 overflow-y-auto border border-outline rounded-lg">
						{apiLogs.length > 0 ? (
							<table className="w-full text-sm">
								<thead className="bg-surface-container-highest sticky top-0">
									<tr>
										<th className="p-2 text-left">
											Timestamp
										</th>
										<th className="p-2 text-left">
											Method
										</th>
										<th className="p-2 text-left">Path</th>
										<th className="p-2 text-left">
											Status
										</th>
										<th className="p-2 text-left">
											Duration
										</th>
									</tr>
								</thead>
								<tbody>
									{apiLogs.map((log, idx) => (
										<tr
											key={idx}
											className="border-t border-outline hover:bg-surface-container-highest"
										>
											<td className="p-2">
												{log.timestamp}
											</td>
											<td className="p-2">
												<span
													className={`px-2 py-1 rounded text-xs font-semibold ${
														log.method === "GET"
															? "bg-blue-100 text-blue-900"
															: log.method ===
																  "POST"
																? "bg-green-100 text-green-900"
																: "bg-gray-100 text-gray-900"
													}`}
												>
													{log.method}
												</span>
											</td>
											<td className="p-2">{log.path}</td>
											<td className="p-2">
												<span
													className={`px-2 py-1 rounded text-xs font-semibold ${
														log.success
															? "bg-green-100 text-green-900"
															: "bg-red-100 text-red-900"
													}`}
												>
													{log.statusCode}
												</span>
											</td>
											<td className="p-2">
												{log.duration}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div className="p-4 text-center text-on-surface-variant">
								No logs available
							</div>
						)}
					</div>
				</div>
			)}

			{/* Mail Queue Tab */}
			{activeTab === "mail-queue" && (
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold text-on-surface">
							Mail Queue Status
						</h2>
						<div className="space-x-2">
							<button
								onClick={fetchMailQueue}
								disabled={loading}
								className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/80 disabled:opacity-50"
							>
								{loading ? "Refreshing..." : "🔄 Refresh"}
							</button>
							<button
								onClick={fetchQueueVisualization}
								className="px-4 py-2 bg-secondary text-on-secondary rounded-lg hover:bg-secondary/80"
							>
								📊 Show Visualization
							</button>
						</div>
					</div>

					{mailQueue && (
						<>
							<div className="grid grid-cols-4 gap-4">
								<div className="bg-primary/10 p-4 rounded-lg">
									<div className="text-sm text-on-surface-variant">
										Total in Queue
									</div>
									<div className="text-2xl font-bold text-primary">
										{mailQueue.status.totalInQueue}
									</div>
								</div>
								<div className="bg-green-100 p-4 rounded-lg">
									<div className="text-sm text-green-900">
										Sent
									</div>
									<div className="text-2xl font-bold text-green-900">
										✅ {mailQueue.status.sent}
									</div>
								</div>
								<div className="bg-yellow-100 p-4 rounded-lg">
									<div className="text-sm text-yellow-900">
										Pending
									</div>
									<div className="text-2xl font-bold text-yellow-900">
										⏳ {mailQueue.status.pending}
									</div>
								</div>
								<div className="bg-red-100 p-4 rounded-lg">
									<div className="text-sm text-red-900">
										Failed
									</div>
									<div className="text-2xl font-bold text-red-900">
										❌ {mailQueue.status.failed}
									</div>
								</div>
							</div>

							<div className="max-h-96 overflow-y-auto border border-outline rounded-lg">
								{mailQueue.entries &&
								mailQueue.entries.length > 0 ? (
									<table className="w-full text-sm">
										<thead className="bg-surface-container-highest sticky top-0">
											<tr>
												<th className="p-2 text-left">
													Mail ID
												</th>
												<th className="p-2 text-left">
													To
												</th>
												<th className="p-2 text-left">
													Type
												</th>
												<th className="p-2 text-left">
													Status
												</th>
												<th className="p-2 text-left">
													Attempts
												</th>
											</tr>
										</thead>
										<tbody>
											{mailQueue.entries.map(
												(entry, idx) => (
													<tr
														key={idx}
														className="border-t border-outline hover:bg-surface-container-highest"
													>
														<td className="p-2">
															#{entry.mailId}
														</td>
														<td className="p-2 text-xs truncate">
															{entry.to}
														</td>
														<td className="p-2">
															{entry.type}
														</td>
														<td className="p-2">
															<span
																className={`px-2 py-1 rounded text-xs font-semibold ${
																	entry.status ===
																	"sent"
																		? "bg-green-100 text-green-900"
																		: entry.status ===
																			  "pending"
																			? "bg-yellow-100 text-yellow-900"
																			: "bg-red-100 text-red-900"
																}`}
															>
																{entry.status.toUpperCase()}
															</span>
														</td>
														<td className="p-2">
															{entry.attempts}
														</td>
													</tr>
												),
											)}
										</tbody>
									</table>
								) : (
									<div className="p-4 text-center text-on-surface-variant">
										No emails in queue
									</div>
								)}
							</div>
						</>
					)}
				</div>
			)}

			{/* Frontend Logs Tab */}
			{activeTab === "frontend-logs" && (
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold text-on-surface">
							Frontend API Logs
						</h2>
						<div className="space-x-2">
							<button
								onClick={handleShowFrontendLogs}
								className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/80"
							>
								📋 Show in Console
							</button>
							<button
								onClick={() => {
									const logs = apiLogger.exportAsJSON();
									const blob = new Blob([logs], {
										type: "application/json",
									});
									const url = URL.createObjectURL(blob);
									const link = document.createElement("a");
									link.href = url;
									link.download = `frontend-api-logs-${new Date().toISOString().split("T")[0]}.json`;
									link.click();
								}}
								className="px-4 py-2 bg-secondary text-on-secondary rounded-lg hover:bg-secondary/80"
							>
								📥 Download
							</button>
							<button
								onClick={() => apiLogger.clearLogs()}
								className="px-4 py-2 bg-tertiary text-on-tertiary rounded-lg hover:bg-tertiary/80"
							>
								🗑️ Clear
							</button>
						</div>
					</div>

					{(() => {
						const stats = apiLogger.getStats();
						return (
							<div className="grid grid-cols-4 gap-4">
								<div className="bg-primary/10 p-4 rounded-lg">
									<div className="text-sm text-on-surface-variant">
										Total Logs
									</div>
									<div className="text-2xl font-bold text-primary">
										{stats.total}
									</div>
								</div>
								<div className="bg-blue-100 p-4 rounded-lg">
									<div className="text-sm text-blue-900">
										Requests
									</div>
									<div className="text-2xl font-bold text-blue-900">
										{stats.requests}
									</div>
								</div>
								<div className="bg-green-100 p-4 rounded-lg">
									<div className="text-sm text-green-900">
										Responses
									</div>
									<div className="text-2xl font-bold text-green-900">
										{stats.responses}
									</div>
								</div>
								<div className="bg-red-100 p-4 rounded-lg">
									<div className="text-sm text-red-900">
										Errors
									</div>
									<div className="text-2xl font-bold text-red-900">
										{stats.errors}
									</div>
								</div>
							</div>
						);
					})()}

					<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
						<p className="text-sm text-blue-900">
							<strong>💡 Pro Tip:</strong> Open browser console
							(F12) to see detailed logs, statistics, and export
							options.
							<br />
							Use{" "}
							<code className="bg-blue-100 px-2 py-1 rounded text-xs">
								window.__apiLogger.displaySummary()
							</code>{" "}
							to view summary.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
