import { useState, useEffect } from "react";

// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================
// API: GET /api/v1/admin/dashboard/stats
// Description: Fetches high-level metrics for dashboard cards.
// Response Example: { totalMonuments: 1284, totalScans: 48200, activeNarrators: 156, ... }
//
// API: GET /api/v1/admin/dashboard/activity
// Description: Fetches the latest system activities (logs, audio generations).
// Response Example: [{ action: "New Monument Added", time: "2023-10-27T10:00:00Z" }]

export default function Dashboard() {
	return (
		<main className="p-8 lg:p-12">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
				<div className="max-w-3xl">
					<h1 className="font-serif text-5xl font-black text-on-background tracking-tight mb-2">
						The Archivist Dashboard
					</h1>
					<p className="text-on-surface-variant font-bold text-lg">
						Heritage Portal v1.0
					</p>
				</div>
				<div className="flex items-center gap-4">
					<button className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-sm">
						<span className="material-symbols-outlined inline mr-2">
							file_download
						</span>
						Export Report
					</button>
					<div className="flex -space-x-3">
						<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
							A
						</div>
						<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold">
							C
						</div>
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg">
					<p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
						Total Monuments
					</p>
					<p className="font-serif text-3xl font-bold text-primary mb-1">
						1,284
					</p>
					<p className="text-xs text-on-surface-variant font-body">
						+12% from last month
					</p>
				</div>
				<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg">
					<p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
						Total Scans
					</p>
					<p className="font-serif text-3xl font-bold text-primary mb-1">
						48.2k
					</p>
					<p className="text-xs text-on-surface-variant font-body">
						+25k from last month
					</p>
				</div>
				<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg">
					<p className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-2">
						Active Narrators
					</p>
					<p className="font-serif text-3xl font-bold text-primary mb-1">
						156
					</p>
					<p className="text-xs text-on-surface-variant font-body">
						-2% from last month
					</p>
				</div>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
				{/* Engagement Trends */}
				<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg">
					<h2 className="font-serif text-2xl font-bold text-on-surface mb-6">
						Engagement Trends
					</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-bold text-on-surface">
								MON
							</span>
							<div className="h-32 w-8 bg-surface-container rounded-t-lg flex items-end justify-center pb-2">
								<div className="h-1/3 w-2 bg-primary rounded-full"></div>
							</div>
						</div>
					</div>
					<div className="flex items-end justify-around h-40 mt-8">
						{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
							(day, i) => (
								<div
									key={day}
									className="flex flex-col items-center gap-2"
								>
									<div
										className="h-24 w-6 bg-surface-container rounded-t"
										style={{ height: `${25 + i * 8}%` }}
									></div>
									<span className="text-xs text-on-surface-variant font-body">
										{day}
									</span>
								</div>
							),
						)}
					</div>
				</div>

				{/* Top Performing Monuments */}
				<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg">
					<h2 className="font-serif text-2xl font-bold text-on-surface mb-6">
						Top Performing Monuments
					</h2>
					<div className="space-y-4">
						{["Taj Mahal", "Amber Fort", "Hawa Mahal"].map(
							(name, i) => (
								<div
									key={i}
									className="flex items-center justify-between p-3 bg-surface-container rounded-lg"
								>
									<div>
										<p className="font-bold text-on-surface text-sm">
											{name}
										</p>
										<p className="text-xs text-on-surface-variant">
											{85 - i * 5}% engagement
										</p>
									</div>
									<div className="w-16 h-8 bg-primary/20 rounded-full flex items-center px-2">
										<div
											className="h-1 bg-primary rounded-full"
											style={{ width: `${85 - i * 5}%` }}
										></div>
									</div>
								</div>
							),
						)}
					</div>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg">
				<h2 className="font-serif text-2xl font-bold text-on-surface mb-6">
					Recent Activity
				</h2>
				<div className="space-y-4">
					{[
						{
							action: "New Monument Added",
							description:
								"Wonders of Graslmünster uploaded to the portal",
							time: "12 mins ago",
						},
						{
							action: "Audio Narrative Generated",
							description:
								'AI-was model "Doric" veneralized synthesis for Luxor Temple',
							time: "3 hours ago",
						},
						{
							action: "High Rating Alert",
							description:
								"Qutub Minar received 50 consecutive 5-star reviews",
							time: "5 hours ago",
						},
					].map((item, i) => (
						<div
							key={i}
							className="flex gap-4 p-4 border-l-4 border-primary bg-surface-container/30 rounded"
						>
							<div className="flex-1">
								<p className="font-bold text-on-surface">
									{item.action}
								</p>
								<p className="text-sm text-on-surface-variant">
									{item.description}
								</p>
								<p className="text-xs text-on-surface-variant mt-1">
									{item.time}
								</p>
							</div>
							<span className="material-symbols-outlined text-primary">
								check_circle
							</span>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
