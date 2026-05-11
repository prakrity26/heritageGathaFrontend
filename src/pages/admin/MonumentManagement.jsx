import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminService from "../../services/admin.service";

export default function MonumentManagement() {
	const [filter, setFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [monuments, setMonuments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
	const navigate = useNavigate();

	const fetchMonuments = async (page = 1, status = filter, search = searchQuery) => {
		setLoading(true);
		try {
			const res = await adminService.getMonuments(page, 10, status, search);
			if (res.success) {
				setMonuments(res.data || []);
				setPagination(res.pagination || { page: 1, limit: 10, totalPages: 1 });
			}
		} catch (error) {
			console.error("Failed to fetch monuments:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Fetch with current filter/search/page
		const debounceTimeout = setTimeout(() => {
			fetchMonuments(pagination.page, filter, searchQuery);
		}, 300); // 300ms debounce for search
		return () => clearTimeout(debounceTimeout);
	}, [filter, searchQuery, pagination.page]);

	const handleDelete = async (e, id) => {
		e.stopPropagation();
		if (window.confirm("Are you sure you want to delete this monument? This action cannot be undone.")) {
			const res = await adminService.deleteMonument(id);
			if (res.success) {
				fetchMonuments(pagination.page, filter, searchQuery);
			} else {
				alert(res.message || "Failed to delete monument");
			}
		}
	};

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
							placeholder="Search by name or description..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setPagination((p) => ({ ...p, page: 1 })); // Reset to first page
							}}
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
					{["All", "Live", "Draft", "Archived"].map((tag) => (
						<button
							key={tag}
							onClick={() => {
								setFilter(tag.toLowerCase());
								setPagination((p) => ({ ...p, page: 1 }));
							}}
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
						{loading ? (
							<tr>
								<td colSpan="6" className="py-8 text-center text-on-surface-variant">
									Loading monuments...
								</td>
							</tr>
						) : monuments.length === 0 ? (
							<tr>
								<td colSpan="6" className="py-8 text-center text-on-surface-variant">
									No monuments found.
								</td>
							</tr>
						) : (
							monuments.map((monument) => (
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
													{monument.era || "Unknown Era"}
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
												{monument.latitude}, {monument.longitude}
											</span>
										</div>
									</td>
									<td className="py-4 px-4 text-sm font-bold text-on-surface">
										{monument.total_scans}
									</td>
									<td className="py-4 px-4 text-sm text-on-surface-variant">
										{new Date(monument.updated_at).toLocaleDateString()}
									</td>
									<td className="py-4 px-4">
										<span
											className={`px-3 py-1 rounded-full text-xs font-bold ${
												monument.status === "LIVE"
													? "bg-green-100 text-green-700"
													: monument.status === "DRAFT"
														? "bg-yellow-100 text-yellow-700"
														: "bg-gray-100 text-gray-700"
											}`}
										>
											{monument.status === "LIVE"
												? "● LIVE"
												: monument.status === "DRAFT"
													? "⚠ DRAFT"
													: "◯ ARCHIVED"}
										</span>
									</td>
									<td className="py-4 px-4">
										<div className="flex gap-2">
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
											<button
												onClick={(e) => handleDelete(e, monument.id)}
												className="inline-block p-2 text-error hover:bg-error-container rounded-lg transition-all"
											>
												<span className="material-symbols-outlined">
													delete
												</span>
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<div className="mt-8 flex justify-center items-center gap-2">
					<button 
						disabled={pagination.page === 1}
						onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
						className="px-3 py-2 bg-surface-container rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
					>
						<span className="material-symbols-outlined">
							chevron_left
						</span>
					</button>
					{[...Array(pagination.totalPages)].map((_, i) => (
						<button
							key={i}
							onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
							className={`px-3 py-2 rounded-lg font-bold ${pagination.page === i + 1 ? "bg-primary text-white" : "bg-surface-container text-on-surface hover:bg-surface-container-high"}`}
						>
							{i + 1}
						</button>
					))}
					<button 
						disabled={pagination.page === pagination.totalPages}
						onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
						className="px-3 py-2 bg-surface-container rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
					>
						<span className="material-symbols-outlined">
							chevron_right
						</span>
					</button>
				</div>
			)}
		</main>
	);
}
