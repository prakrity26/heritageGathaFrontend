// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================
// API: GET /api/v1/admin/feedback
// Description: Fetches paginated user feedback logs including model performance reports.
// Response Example: { "total": 1200, "average_rating": 4.8, feedbacks: [{ ... }] }

export default function FeedbackHub() {
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
						4.8
					</p>
					<p className="text-sm text-on-surface-variant mb-4">/5.0</p>
					<p className="text-xs text-on-surface-variant">
						{">"}+2.6% from last week
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
									94%
								</span>
							</div>
							<div className="h-2 bg-surface-container rounded-full overflow-hidden">
								<div className="h-full w-11/12 bg-primary"></div>
							</div>
						</div>
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-xs font-bold uppercase text-on-surface-variant font-body">
									Narrative (NTT)
								</span>
								<span className="text-sm font-bold text-primary">
									88%
								</span>
							</div>
							<div className="h-2 bg-surface-container rounded-full overflow-hidden">
								<div className="h-full w-10/12 bg-primary"></div>
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
					<button className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold">
						All Reviews
					</button>
					<button className="px-4 py-2 bg-surface-container text-on-surface rounded-full text-xs font-bold hover:bg-surface-container-high transition-all">
						Needs Attention
					</button>
				</div>

				{/* Feedback Items */}
				<div className="space-y-4">
					{[
						{
							monument: "Taj Mahal Narrative",
							author: "ASIAM SINGH",
							time: "3 hours ago",
							rating: 5,
							sentiment: "positive",
							content:
								'"The audio generation for the dacrylatory of the dome construction was incredibly vivid. It felt like I was back in the 17th century!"',
							status: "POSITIVE",
						},
						{
							monument: "Hawa Mahal Audio Fault",
							author: "ELENA FISCHER",
							time: "5 hours ago",
							rating: 1,
							sentiment: "negative",
							content:
								'"The TTS model struggled with the local pronunciation of "Havelis". It sounded robotic and broke the immersion."',
							status: "NEGATIVE",
						},
						{
							monument: "Qutub Minar Landmark",
							author: "MARCUS",
							time: "8 hours ago",
							rating: 4,
							sentiment: "neutral",
							content:
								'"Recognition was fast. But the narrative content is a bit too brief. Would love deeper context."',
							status: "NEUTRAL",
						},
					].map((feedback, i) => (
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
					))}
				</div>

				{/* Load More */}
				<button className="w-full py-3 border-2 border-outline-variant text-on-surface-variant rounded-lg font-bold hover:bg-surface-container transition-all uppercase tracking-wider text-xs font-body">
					Explore More Records
				</button>
			</div>
		</main>
	);
}
