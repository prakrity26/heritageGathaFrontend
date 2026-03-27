import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================
// API: GET /api/v1/admin/monuments?page=1&limit=25&filter=all
// Description: Fetches paginated list of all monuments with stats.
// Response: { count: 125, data: [{ id: "m1", name: "Taj Mahal", status: "live", ... }] }
//
// API: DELETE /api/v1/admin/monuments/:id
// Description: Hard deletes or achieves a monument record.

export default function MonumentManagement() {
	const [filter, setFilter] = useState("all");
	const navigate = useNavigate();

	const monuments = [
		{
			id: 1,
			name: "Taj Mahal",
			location: "Agra, UP",
			scans: "1.2M+",
			lastUpdate: "Oct 24, 2023",
			status: "live",
		},
		{
			id: 2,
			name: "Rani Ki Vav",
			location: "Patan, GJ",
			scans: "450K",
			lastUpdate: "Nov 12, 2023",
			status: "needs-audio",
		},
		{
			id: 3,
			name: "Golden Temple",
			location: "Amritsar, PB",
			scans: "2.1M",
			lastUpdate: "Dec 01, 2023",
			status: "live",
		},
		{
			id: 4,
			name: "Konark Sun Temple",
			location: "Konark, OR",
			scans: "120K",
			lastUpdate: "Jan 14, 2024",
			status: "draft",
		},
		{
			id: 5,
			name: "Hampi Ruins",
			location: "Hampi, KA",
			scans: "890K",
			lastUpdate: "Feb 05, 2024",
			status: "live",
		},
	];

	return (
		<main className="p-8 lg:p-12">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
				<div>
					<h1 className="font-serif text-5xl font-black text-on-background tracking-tight">
						Monument Inventory
					</h1>
					<p className="text-on-surface-variant font-bold text-lg mt-2">
						Review and manage the digitized heritage ecosystem.
					</p>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex -space-x-3">
						<div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-white font-bold border-2 border-white">
							A
						</div>
						<div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-on-secondary-container font-bold border-2 border-white">
							C
						</div>
					</div>
					<Link
						to="/admin/monument/new"
						className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all"
					>
						<span className="material-symbols-outlined">add</span>
						New Monument
					</Link>
				</div>
			</div>

			{/* Search & Filters */}
			<div className="mb-8 space-y-4">
				<div className="flex gap-4">
					<div className="flex-1 relative">
						<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
							search
						</span>
						<input
							type="text"
							placeholder="Search by name, location, or tag..."
							className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
						/>
					</div>
					<button className="px-6 py-3 bg-surface-container rounded-lg font-bold text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-2">
						<span className="material-symbols-outlined">tune</span>
						Filters
					</button>
				</div>

				{/* Filter Tags */}
				<div className="flex flex-wrap gap-2">
					{["All Sites", "Agra", "Patan", "Hampi"].map((tag) => (
						<button
							key={tag}
							onClick={() => setFilter(tag.toLowerCase())}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
								filter === tag.toLowerCase()
									? "bg-primary text-white"
									: "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
							}`}
						>
							{tag}
						</button>
					))}
				</div>
			</div>

			{/* Monuments Table */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="border-b-2 border-surface-container">
						<tr className="text-left">
							<th className="pb-4 px-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider font-body">
								Monument Name
							</th>
							<th className="pb-4 px-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider font-body">
								Location
							</th>
							<th className="pb-4 px-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider font-body">
								Total Scans
							</th>
							<th className="pb-4 px-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider font-body">
								Last Updated
							</th>
							<th className="pb-4 px-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider font-body">
								Status
							</th>
							<th className="pb-4 px-4 font-bold text-on-surface-variant text-xs uppercase tracking-wider font-body">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{monuments.map((monument) => (
							<tr
								key={monument.id}
								onClick={() =>
									navigate(
										`/admin/monument/${monument.id}/edit`,
										{ state: { monument } },
									)
								}
								className="border-b border-surface-container hover:bg-surface-container-low transition-colors cursor-pointer group"
							>
								<td className="py-4 px-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
											<span className="material-symbols-outlined text-sm text-primary">
												account_balance
											</span>
										</div>
										<div>
											<p className="font-bold text-on-surface text-sm">
												{monument.name}
											</p>
											<p className="text-xs text-on-surface-variant">
												UNESCO World Site
											</p>
										</div>
									</div>
								</td>
								<td className="py-4 px-4">
									<div className="flex items-center gap-1">
										<span className="material-symbols-outlined text-sm text-on-surface-variant">
											location_on
										</span>
										<span className="text-sm text-on-surface-variant">
											{monument.location}
										</span>
									</div>
								</td>
								<td className="py-4 px-4 text-sm font-bold text-on-surface">
									{monument.scans}
								</td>
								<td className="py-4 px-4 text-sm text-on-surface-variant">
									{monument.lastUpdate}
								</td>
								<td className="py-4 px-4">
									<span
										className={`px-3 py-1 rounded-full text-xs font-bold ${
											monument.status === "live"
												? "bg-green-100 text-green-700"
												: monument.status ===
													  "needs-audio"
													? "bg-yellow-100 text-yellow-700"
													: "bg-gray-100 text-gray-700"
										}`}
									>
										{monument.status === "live"
											? "● LIVE"
											: monument.status === "needs-audio"
												? "⚠ NEEDS AUDIO"
												: "◯ DRAFT"}
									</span>
								</td>
								<td className="py-4 px-4">
									<Link
										to={`/admin/monument/${monument.id}/edit`}
										state={{ monument }}
										className="inline-block p-2 hover:bg-surface-container rounded-lg transition-all"
										onClick={(e) => e.stopPropagation()}
									>
										<span className="material-symbols-outlined text-on-surface-variant">
											edit
										</span>
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="mt-8 flex justify-center items-center gap-2">
				<button className="px-3 py-2 bg-surface-container rounded-lg text-on-surface-variant hover:bg-surface-container-high">
					<span className="material-symbols-outlined">
						chevron_left
					</span>
				</button>
				{[1, 2, 3, "...", 25].map((num, i) => (
					<button
						key={i}
						className={`px-3 py-2 rounded-lg font-bold ${num === 1 ? "bg-primary text-white" : "bg-surface-container text-on-surface hover:bg-surface-container-high"}`}
					>
						{num}
					</button>
				))}
				<button className="px-3 py-2 bg-surface-container rounded-lg text-on-surface-variant hover:bg-surface-container-high">
					<span className="material-symbols-outlined">
						chevron_right
					</span>
				</button>
			</div>
		</main>
	);
}
