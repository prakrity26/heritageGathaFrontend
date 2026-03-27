// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================
// API: GET /api/v1/admin/audio/jobs
// Description: Fetches the list of all audio generation jobs.
// Response Example: { jobs: [{ id: "j1", monument: "Patan", status: "PROCESSING", lang:"Nepali", startedAt: "..." }]}

import { useState } from "react";

export default function AudioGeneration() {
	const [activeTab, setActiveTab] = useState("processing");

	const jobs = [
		{
			id: "JOB-489A",
			monument: "Krishna Mandir",
			targetLanguage: "Hindi",
			status: "PROCESSING",
			progress: 65,
			time: "2 mins ago",
		},
		{
			id: "JOB-488C",
			monument: "Taleju Bell",
			targetLanguage: "Nepali",
			status: "COMPLETED",
			progress: 100,
			time: "1 hour ago",
		},
		{
			id: "JOB-487X",
			monument: "Boudhanath Stupa",
			targetLanguage: "English",
			status: "FAILED",
			progress: 32,
			time: "5 hours ago",
		},
	];

	const filteredJobs = jobs.filter(
		(job) =>
			activeTab === "all" ||
			(activeTab === "processing" && job.status === "PROCESSING") ||
			(activeTab === "completed" && job.status === "COMPLETED"),
	);

	return (
		<main className="p-8 lg:p-12">
			{/* Header */}
			<div className="mb-10">
				<h1 className="font-serif text-5xl font-black text-on-background tracking-tight mb-2">
					Audio Synthesis Hub
				</h1>
				<p className="text-on-surface-variant font-bold text-lg">
					Monitor global XTTS model queues and outputs
				</p>
			</div>

			{/* Tabs */}
			<div className="flex gap-4 border-b border-surface-container mb-8">
				{["processing", "completed", "all"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`pb-3 px-2 font-bold text-sm uppercase tracking-widest transition-colors ${
							activeTab === tab
								? "text-primary border-b-2 border-primary"
								: "text-on-surface-variant hover:text-on-surface"
						}`}
					>
						{tab}
					</button>
				))}
			</div>

			{/* Job Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				{filteredJobs.map((job) => (
					<div
						key={job.id}
						className="bg-surface-container-lowest p-6 rounded-xl shadow-lg border border-surface-container flex flex-col justify-between"
					>
						<div>
							<div className="flex justify-between items-start mb-4">
								<span className="font-label text-xs font-bold text-on-surface-variant">
									ID: {job.id}
								</span>
								<span
									className={`text-xs px-2 py-1 rounded font-bold ${
										job.status === "PROCESSING"
											? "bg-primary/20 text-primary"
											: job.status === "COMPLETED"
												? "bg-secondary-container text-on-secondary-container"
												: "bg-error-container text-on-error-container"
									}`}
								>
									{job.status}
								</span>
							</div>
							<h3 className="font-serif font-bold text-xl text-on-surface mb-1">
								{job.monument}
							</h3>
							<p className="text-sm font-body text-on-surface-variant mb-6">
								Target:{" "}
								<span className="font-bold text-on-surface">
									{job.targetLanguage}
								</span>
							</p>
						</div>

						{/* Progress Bar */}
						<div>
							<div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-2">
								<div
									className={`h-full rounded-full transition-all duration-500 ${job.status === "FAILED" ? "bg-error" : "bg-primary"}`}
									style={{ width: `${job.progress}%` }}
								></div>
							</div>
							<div className="flex justify-between items-center text-xs text-on-surface-variant">
								<span>{job.time}</span>
								<span className="font-bold">
									{job.progress}%
								</span>
							</div>
						</div>
					</div>
				))}

				{filteredJobs.length === 0 && (
					<div className="col-span-full py-12 text-center text-on-surface-variant">
						No synthesis jobs found for this category.
					</div>
				)}
			</div>
		</main>
	);
}
