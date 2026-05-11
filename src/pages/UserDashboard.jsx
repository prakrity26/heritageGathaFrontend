import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import userService from "../services/user.service";

export default function UserDashboard() {
	const { user } = useSelector((state) => state.auth);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboard = async () => {
			const res = await userService.getDashboardData();
			if (res.success) {
				setData(res.data);
			}
			setLoading(false);
		};
		fetchDashboard();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
				<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
				<p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">Accessing Personal Archives...</p>
			</div>
		);
	}

	const stats = [
		{ label: "Sites Scanned", value: data?.stats?.totalScans || 0, icon: "account_balance", color: "primary" },
		{ label: "Reviews Penned", value: data?.stats?.totalReviews || 0, icon: "history_edu", color: "secondary" },
		{ label: "Favorite Era", value: data?.stats?.favoriteEra || "N/A", icon: "auto_stories", color: "tertiary" },
		{ label: "Discovery Rank", value: `Lvl ${data?.stats?.discoveryLevel || 1}`, icon: "military_tech", color: "primary" }
	];

	return (
		<main className="min-h-screen bg-surface pb-24">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary/10 via-surface to-surface pt-32 pb-16 px-6 lg:px-12 border-b border-surface-container">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
								<span className="material-symbols-outlined text-2xl">person_pin</span>
							</div>
							<span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Archivist Profile</span>
						</div>
						<h1 className="font-serif text-5xl md:text-7xl font-black text-on-surface tracking-tight leading-tight">
							Namaste, <span className="text-primary">{user?.full_name?.split(" ")[0]}</span>.
						</h1>
						<p className="text-on-surface-variant text-lg font-medium max-w-xl">
							Welcome back to your personal chronicle. Your journey through Nepal's heritage continues.
						</p>
					</div>
					
					{/* Discovery Progress Card */}
					<div className="w-full md:w-80 bg-surface-container-low p-6 rounded-[2.5rem] border border-surface-container shadow-sm">
						<div className="flex justify-between items-center mb-4">
							<span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Discovery Progress</span>
							<span className="text-xs font-black text-primary">Level {data?.stats?.discoveryLevel || 1}</span>
						</div>
						<div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden mb-3">
							<div 
								className="h-full bg-primary transition-all duration-1000" 
								style={{ width: `${((data?.stats?.totalScans % 5) / 5) * 100}%` }}
							></div>
						</div>
						<p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
							{5 - (data?.stats?.totalScans % 5)} scans until next milestone
						</p>
					</div>
				</div>
			</section>

			<div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-8">
				{/* Metrics Grid */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
					{stats.map((stat, i) => (
						<div key={i} className="bg-surface-container-lowest p-6 rounded-[2rem] border border-surface-container shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
							<div className="flex items-center gap-3 mb-4">
								<span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
									{stat.icon}
								</span>
								<span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">{stat.label}</span>
							</div>
							<p className="text-2xl font-serif font-black text-on-surface truncate">
								{stat.value}
							</p>
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
					{/* Left: Chronicle & Achievements */}
					<div className="lg:col-span-2 space-y-16">
						
						{/* Achievement Badges */}
						<section>
							<div className="flex items-center gap-4 mb-8">
								<h2 className="font-serif text-3xl font-black text-on-surface">Archeological Milestones</h2>
								<div className="h-[2px] flex-1 bg-surface-container"></div>
							</div>
							<div className="flex flex-wrap gap-4">
								{data?.stats?.badges?.length > 0 ? (
									data.stats.badges.map((badge) => (
										<div key={badge.id} className="flex items-center gap-3 px-5 py-3 bg-surface-container-low rounded-2xl border border-primary/20 shadow-sm hover:border-primary transition-all group">
											<span className="material-symbols-outlined text-primary text-xl group-hover:animate-bounce">
												{badge.icon}
											</span>
											<span className="text-xs font-black uppercase tracking-widest text-on-surface">
												{badge.title}
											</span>
										</div>
									))
								) : (
									<p className="text-sm font-bold text-on-surface-variant italic">No milestones unlocked yet. Embark on your first discovery!</p>
								)}
							</div>
						</section>

						{/* Heritage Chronicle (Scans) */}
						<section>
							<div className="flex items-center justify-between mb-8">
								<h2 className="font-serif text-3xl font-black text-on-surface">The Heritage Trail</h2>
								<Link to="/" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Expand Search</Link>
							</div>
							<div className="space-y-4">
								{data?.scans?.length > 0 ? (
									data.scans.map((scan) => (
										<Link 
											key={scan.id} 
											to={`/monument/${scan.monumentId}`}
											className="block bg-surface-container-lowest p-4 rounded-[2rem] border border-surface-container shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
										>
											<div className="flex items-center gap-6">
												<div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container border border-surface-container flex-shrink-0">
													{scan.imageUrl ? (
														<img src={scan.imageUrl} alt={scan.monumentName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
													) : (
														<div className="w-full h-full flex items-center justify-center opacity-20">
															<span className="material-symbols-outlined">image</span>
														</div>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[8px] font-black uppercase tracking-widest">
															{scan.era || "Era Unknown"}
														</span>
														{scan.verified && (
															<span className="material-symbols-outlined text-primary text-xs font-bold">verified</span>
														)}
													</div>
													<h4 className="font-serif font-black text-xl text-on-surface truncate group-hover:text-primary transition-colors">
														{scan.monumentName}
													</h4>
													<p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
														Discovered on {new Date(scan.scannedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
													</p>
												</div>
												<span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all mr-4">
													arrow_forward_ios
												</span>
											</div>
										</Link>
									))
								) : (
									<div className="p-12 text-center bg-surface-container-low rounded-[3rem] border-2 border-dashed border-surface-container">
										<span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4 font-thin">camera_enhance</span>
										<p className="text-sm font-bold text-on-surface-variant italic uppercase tracking-widest">Your discovery log is silent. Start scanning monuments to begin.</p>
									</div>
								)}
							</div>
						</section>
					</div>

					{/* Right: Reviews & Insights */}
					<div className="space-y-12">
						<section className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container shadow-sm">
							<h3 className="font-serif text-2xl font-black text-on-surface mb-8">Oral Records</h3>
							<div className="space-y-6">
								{data?.reviews?.length > 0 ? (
									data.reviews.map((review) => (
										<div key={review.id} className="space-y-3 pb-6 border-b border-surface-container last:border-0 last:pb-0">
											<div className="flex justify-between items-center">
												<h5 className="font-bold text-on-surface text-sm truncate uppercase tracking-widest">{review.monumentName}</h5>
												<div className="flex text-amber-400 text-xs">
													{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
												</div>
											</div>
											<p className="text-xs text-on-surface-variant font-body leading-relaxed line-clamp-3 italic">
												"{review.comment || "Left a silent reverance."}"
											</p>
											<div className="flex justify-between items-center">
												<span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
													review.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-700' : 
													review.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
												}`}>
													{review.sentiment}
												</span>
												<span className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
													{new Date(review.date).toLocaleDateString()}
												</span>
											</div>
										</div>
									))
								) : (
									<p className="text-xs font-bold text-on-surface-variant italic text-center py-8">Your cultural critiques will appear here.</p>
								)}
							</div>
						</section>

						{/* Identity Card */}
						<section className="bg-primary text-on-primary p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden group">
							<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
							<div className="relative z-10 space-y-4">
								<h4 className="font-serif text-xl font-black italic">The Archivist's Creed</h4>
								<p className="text-xs leading-relaxed opacity-80 font-medium">
									"To preserve the echoes of the past is to secure the foundations of the future. Every scan, every review, every discovery is a thread in the eternal tapestry of Nepal."
								</p>
								<div className="pt-4 flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
										<span className="material-symbols-outlined text-sm">verified_user</span>
									</div>
									<span className="text-[10px] font-black uppercase tracking-widest">Verified Heritage Protector</span>
								</div>
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
}
