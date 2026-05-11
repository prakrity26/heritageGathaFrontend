// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================
// API: GET /api/v1/admin/feedback
// Description: Fetches paginated user feedback logs including model performance reports.
// Response Example: { "total": 1200, "average_rating": 4.8, feedbacks: [{ ... }] }

import { useState, useEffect } from "react";
import adminService from "../../services/admin.service";

export default function FeedbackHub() {
	const [data, setData] = useState({ systemHealth: {}, feedbacks: [] });
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await adminService.getFeedbackHub();
				if (res.success) {
					setData(res.data);
				}
			} catch (error) {
				console.error("Failed to fetch feedback data:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const filteredFeedbacks = data.feedbacks?.filter((f) => 
		filter === "all" || 
		(filter === "needs-attention" && f.rating <= 3)
	) || [];

	if (loading) {
		return <div className="p-12 text-center text-on-surface-variant">Loading feedback data...</div>;
	}

	return (
		<main className="p-8 lg:p-12">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
				<div>
					<h1 className="font-serif text-5xl font-black text-on-background tracking-tight">
						Feedback Hub
					</h1>
					<p className="text-on-surface-variant font-bold text-lg mt-2">
						Reviewing community narratives and system accuracy.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="material-symbols-outlined text-primary">
						search
					</span>
					<input
						type="text"
						placeholder="Search feedback..."
						className="px-4 py-2 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant focus:border-primary focus:outline-none transition-colors"
					/>
				</div>
			</div>

			{/* System Health */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
				{/* Overall Satisfaction */}
				<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg">
					<p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
						System Health
					</p>
					<p className="font-serif text-5xl font-bold text-primary mb-1">
						{data.systemHealth?.averageRating?.toFixed(1) || "0.0"}
					</p>
					<p className="text-sm text-on-surface-variant mb-4">/5.0 based on {data.systemHealth?.totalReviews || 0} reviews</p>
					<p className="text-xs text-on-surface-variant">
						Real-time system accuracy
					</p>
				</div>

				{/* AI Model Precision */}
				<div className="bg-primary/10 p-6 rounded-xl shadow-lg border border-primary">
					<h3 className="font-serif text-lg font-bold text-primary mb-4">
						AI Model Precision
					</h3>
					<div className="space-y-3">
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-xs font-bold uppercase text-on-surface-variant font-body">
									Vision (CNN)
								</span>
								<span className="text-sm font-bold text-primary">
									{data.systemHealth?.visionPrecision || 0}%
								</span>
							</div>
							<div className="h-2 bg-surface-container rounded-full overflow-hidden">
								<div className="h-full bg-primary" style={{ width: `${data.systemHealth?.visionPrecision || 0}%` }}></div>
							</div>
						</div>
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-xs font-bold uppercase text-on-surface-variant font-body">
									Narrative (NTT)
								</span>
								<span className="text-sm font-bold text-primary">
									{data.systemHealth?.narrativePrecision || 0}%
								</span>
							</div>
							<div className="h-2 bg-surface-container rounded-full overflow-hidden">
								<div className="h-full bg-primary" style={{ width: `${data.systemHealth?.narrativePrecision || 0}%` }}></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Contributions */}
			<div className="space-y-6">
				<h2 className="font-serif text-2xl font-bold text-on-surface">
					Recent Contributions
				</h2>

				{/* Filter Tabs */}
				<div className="flex gap-2 flex-wrap">
					<button 
						onClick={() => setFilter("all")}
						className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === "all" ? "bg-primary text-white" : "bg-surface-container text-on-surface hover:bg-surface-container-high"}`}
					>
						All Reviews
					</button>
					<button 
						onClick={() => setFilter("needs-attention")}
						className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === "needs-attention" ? "bg-primary text-white" : "bg-surface-container text-on-surface hover:bg-surface-container-high"}`}
					>
						Needs Attention
					</button>
				</div>

				{/* Feedback Items */}
				<div className="space-y-4">
					{filteredFeedbacks.length === 0 ? (
						<div className="py-8 text-center text-on-surface-variant">No feedback found.</div>
					) : (
						filteredFeedbacks.map((feedback) => (
						<div
							key={i}
							className={`p-6 rounded-xl border-l-4 ${
								feedback.sentiment === "positive"
									? "bg-green-50 border-green-500"
									: feedback.sentiment === "negative"
										? "bg-red-50 border-red-500"
										: "bg-surface-container-lowest border-outline"
							}`}
						>
							<div className="flex justify-between items-start mb-3">
								<div>
									<p className="font-bold text-on-surface font-body">
										{feedback.monument}
									</p>
									<p className="text-xs text-on-surface-variant font-body">
										BY {feedback.author} • {feedback.time}
									</p>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-xs font-bold ${
										feedback.sentiment === "positive"
											? "bg-green-100 text-green-700"
											: feedback.sentiment === "negative"
												? "bg-red-100 text-red-700"
												: "bg-gray-100 text-gray-700"
									}`}
								>
									{feedback.status}
								</span>
							</div>

							<div className="flex gap-1 mb-3">
								{[...Array(5)].map((_, idx) => (
									<span
										key={idx}
										className={`material-symbols-outlined ${idx < feedback.rating ? "text-secondary" : "text-outline"}`}
									>
										star
									</span>
								))}
							</div>

							<p className="text-sm text-on-surface-variant font-body italic mb-4">
								"{feedback.content}"
							</p>

							<div className="flex gap-2">
								<button className="text-xs font-bold text-primary hover:underline">
									View Monument
								</button>
								<button className="text-xs font-bold text-primary hover:underline">
									Flag
								</button>
								<button className="text-xs font-bold text-primary hover:underline">
									Mark as Addressed
								</button>
							</div>
						</div>
					))
					)}
				</div>

				{/* Load More */}
				<button className="w-full py-3 border-2 border-outline-variant text-on-surface-variant rounded-lg font-bold hover:bg-surface-container transition-all uppercase tracking-wider text-xs font-body">
					Explore More Records
				</button>
			</div>
		</main>
	);
}
