import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/admin.service";
import { toast } from "react-hot-toast";

export default function Dashboard() {
	const [stats, setStats] = useState({
		totalMonuments: 0,
		totalScans: 0,
		activeNarrators: 0,
		monumentPopularity: [],
	});
	const [activity, setActivity] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			setLoading(true);
			try {
				const [statsRes, activityRes] = await Promise.all([
					adminService.getDashboardStats(),
					adminService.getDashboardActivity(),
				]);

				if (statsRes.success) setStats(statsRes.data);
				if (activityRes.success) setActivity(activityRes.data);
			} catch (error) {
				toast.error("Failed to synchronize archivist data");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	return (
		<main className="p-8 lg:p-12 max-w-[1600px] mx-auto">
			{/* Header with Glassmorphism */}
			<div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
				<div>
					<div className="flex items-center gap-4 mb-4">
						<span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-[0.2em] border border-primary/20">
							Archivist Portal v1.2
						</span>
						<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
						<span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Live Sync Active</span>
					</div>
					<h1 className="font-serif text-5xl xl:text-6xl font-black text-on-background tracking-tight leading-tight">
						Heritage <span className="text-primary italic">Orchestration</span> Hub
					</h1>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex flex-col items-end">
						<span className="text-sm font-black text-on-surface uppercase tracking-widest">Senior Archivist</span>
						<span className="text-xs font-medium text-on-surface-variant">admin@heritagegatha.com</span>
					</div>
					<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg shadow-primary/20 flex items-center justify-center text-on-primary font-serif text-2xl font-black">
						A
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Main Content Area (3 cols) */}
				<div className="lg:col-span-3 space-y-8">
					
					{/* Stats Grid - High Impact */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{ label: "Total Monuments", val: stats.totalMonuments, sub: "Sites Registered", icon: "account_balance" },
							{ label: "Total Global Scans", val: stats.totalScans, sub: "Visitor Interactions", icon: "qr_code_scanner" },
							{ label: "Neural Narratives", val: stats.activeNarrators, sub: "Audio Tracks Live", icon: "record_voice_over" },
						].map((item, i) => (
							<div key={i} className="bg-surface-container-lowest p-8 rounded-[2rem] border border-surface-container shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
								<div className="flex justify-between items-start mb-6">
									<div className="p-3 bg-surface-container-low rounded-2xl text-primary group-hover:scale-110 transition-transform">
										<span className="material-symbols-outlined text-3xl">{item.icon}</span>
									</div>
									<span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors">trending_up</span>
								</div>
								<p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2">{item.label}</p>
								<h3 className="font-serif text-4xl font-black text-on-surface mb-2">
									{loading ? "..." : item.val.toLocaleString()}
								</h3>
								<p className="text-sm font-medium text-on-surface-variant/60">{item.sub}</p>
							</div>
						))}
					</div>

					{/* Charts & Popularity Ledger */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
						{/* Engagement Visualization */}
						<div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-surface-container shadow-sm relative overflow-hidden group">
							<div className="flex items-center justify-between mb-10">
								<div>
									<h2 className="font-serif text-2xl font-black text-on-surface mb-1">Engagement Aura</h2>
									<p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Weekly Interaction Trends</p>
								</div>
							</div>
							
							<div className="flex items-end justify-between h-48 px-4 relative">
								<div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between opacity-10 pointer-events-none">
									{[1, 2, 3, 4].map(l => <div key={l} className="w-full border-t border-on-surface"></div>)}
								</div>

								{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => (
									<div key={day} className="flex flex-col items-center gap-4 group/bar z-10">
										<div className="relative w-10">
											<div 
												className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-xl transition-all duration-700 delay-100 ease-out hover:brightness-125"
												style={{ height: loading ? '0px' : `${40 + (Math.sin(i) * 30) + 30}%` }}
											></div>
										</div>
										<span className="text-xs font-black text-on-surface-variant/40 tracking-widest group-hover/bar:text-primary transition-colors">{day}</span>
									</div>
								))}
							</div>
						</div>

						{/* Global Monument Popularity */}
						<div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-surface-container shadow-sm">
							<h2 className="font-serif text-2xl font-black text-on-surface mb-8">Monument Popularity</h2>
							<div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
								{loading ? (
									<div className="space-y-4">
										{[1, 2, 3].map(i => <div key={i} className="h-20 bg-surface-container rounded-2xl animate-pulse"></div>)}
									</div>
								) : stats.monumentPopularity.length > 0 ? (
									stats.monumentPopularity.map((mon, i) => (
										<div key={mon.id} className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl hover:bg-surface-container-low transition-all group">
											<div className="flex items-center gap-4">
												<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
													{i + 1}
												</div>
												<h4 className="font-bold text-on-surface text-sm">{mon.name}</h4>
											</div>
											<div className="flex flex-col items-end">
												<span className="text-lg font-black text-primary">{mon.scans}</span>
												<span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Total Scans</span>
											</div>
										</div>
									))
								) : (
									<div className="py-20 text-center text-on-surface-variant/40 italic uppercase tracking-widest text-xs">No scan metrics recorded yet</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar Discovery Chronicle */}
				<div className="space-y-8">
					{/* Live Identification Feed */}
					<section className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container shadow-sm h-[700px] flex flex-col overflow-hidden">
						<div className="flex items-center justify-between mb-8 shrink-0">
							<h3 className="text-xs uppercase tracking-[0.2em] font-black text-on-surface-variant flex items-center gap-2">
								<span className="material-symbols-outlined text-sm">history_edu</span>
								Discovery Feed
							</h3>
							<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
						</div>
						<div className="space-y-8 overflow-y-auto pr-4 custom-scrollbar">
							{loading ? (
								<div className="space-y-8">
									{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-surface-container rounded-xl animate-pulse"></div>)}
								</div>
							) : activity.length > 0 ? (
								activity.map((item, i) => (
									<div key={i} className="relative pl-8 group">
										<div className="absolute left-[3px] top-2 bottom-0 w-[2px] bg-surface-container-high group-last:hidden"></div>
										<div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
										
										<p className="text-xs font-black text-on-surface uppercase tracking-widest mb-1">{item.action}</p>
										<p className="text-sm text-on-surface-variant leading-snug mb-2 font-medium">{item.description}</p>
										<p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
											{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.time).toLocaleDateString()}
										</p>
									</div>
								))
							) : (
								<div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center px-4">
									<span className="material-symbols-outlined text-6xl mb-4 font-thin">history</span>
									<p className="text-xs font-black uppercase tracking-[0.2em]">Chronicle Empty</p>
								</div>
							)}
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}
