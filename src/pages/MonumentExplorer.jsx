import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import monumentService from "../services/monument.service";

export default function MonumentExplorer() {
	const selectedLanguage = useSelector((state) => state.language.language);
	const [monuments, setMonuments] = useState([]);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [locationStatus, setLocationStatus] = useState("checking"); 
	const [coords, setCoords] = useState(null);

	// 1. Initial Location Sync
	useEffect(() => {
		const requestLocation = () => {
			if (!navigator.geolocation) {
				setLocationStatus("denied");
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
					setCoords({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					});
					setLocationStatus("granted");
				},
				(error) => {
					console.warn("Geolocation permission deferred:", error.message);
					setLocationStatus("denied");
				},
				{ enableHighAccuracy: true, timeout: 5000 }
			);
		};
		requestLocation();
	}, []);

	// 2. Data Fetching Logic (Global + Proximity Aware)
	const fetchMonuments = async (pageNum, isNewSearch = false) => {
		if (pageNum === 1) setLoading(true);
		else setLoadingMore(true);

		try {
			const params = {
				page: pageNum,
				limit: 12,
				latitude: coords?.lat,
				longitude: coords?.lng
			};

			const res = await monumentService.getAllMonuments(params);
			
			if (res.success) {
				if (isNewSearch) {
					setMonuments(res.data);
				} else {
					setMonuments(prev => [...prev, ...res.data]);
				}
				setPagination(res.pagination);
			}
		} catch (err) {
			console.error("Discovery Engine Error:", err);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	// Trigger fetch when coords are ready or location is denied (fallback to default)
	useEffect(() => {
		if (locationStatus !== "checking") {
			fetchMonuments(1, true);
		}
	}, [coords, locationStatus]);

	const loadMore = () => {
		if (pagination && page < pagination.totalPages) {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchMonuments(nextPage);
		}
	};

	const formatDistance = (meters) => {
		if (!meters) return null;
		if (meters < 1000) return `${Math.round(meters)} m`;
		return `${(meters / 1000).toFixed(1)} K.M.`;
	};

	return (
		<main className="min-h-screen bg-surface pb-32">
			{/* Hero Header */}
			<section className="bg-gradient-to-br from-primary/10 via-surface to-surface pt-32 pb-16 px-6 lg:px-12 border-b border-surface-container">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
							<span className="material-symbols-outlined text-xl">explore</span>
						</div>
						<span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Heritage Explorer</span>
					</div>
					<h1 className="font-serif text-5xl md:text-7xl font-black text-on-surface tracking-tight leading-tight">
						Universal <span className="text-primary italic">Archives</span>.
					</h1>
					<p className="text-on-surface-variant text-lg font-medium max-w-xl mt-4">
						{locationStatus === 'granted' 
							? "Displaying the nearest artifacts from your current coordinates."
							: "Explore the complete architectural tapestry of our heritage."}
					</p>
				</div>
			</section>

			<div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
				{loading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
							<div key={i} className="bg-surface-container-low rounded-[2rem] aspect-square animate-pulse"></div>
						))}
					</div>
				) : (monuments && monuments.length > 0) ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{monuments.map((mon, idx) => {
								const localizedName = selectedLanguage === 'hi' ? (mon.name_hi || mon.name) : 
													 selectedLanguage === 'ne' ? (mon.name_ne || mon.name) : 
													 mon.name;
								const imageUrl = mon.images?.[0]?.url;

								return (
									<Link 
										key={`${mon.id}-${idx}`} 
										to={`/monument/${mon.id}`}
										className="group relative bg-surface-container-low rounded-[2rem] overflow-hidden border border-surface-container shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500"
									>
										{/* Distance Badge */}
										{mon.distance && (
											<div className="absolute top-6 left-6 z-20 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-green-500/20 flex items-center gap-2 shadow-lg">
												<span className="material-symbols-outlined text-green-600 text-sm filled">location_on</span>
												<span className="text-[10px] font-black uppercase tracking-widest text-green-700">
													{formatDistance(mon.distance)}
												</span>
											</div>
										)}

										{/* Image Section */}
										<div className="aspect-square relative overflow-hidden bg-surface-container-high">
											{imageUrl ? (
												<img 
													src={imageUrl} 
													alt={localizedName}
													className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
												/>
											) : (
												<div className="w-full h-full flex flex-col items-center justify-center opacity-20">
													<span className="material-symbols-outlined text-6xl font-thin">account_balance</span>
												</div>
											)}
											<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
											
											{/* Content Overlay */}
											<div className="absolute inset-x-6 bottom-6 z-10">
												<p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1.5">
													{mon.era || "Historical Site"}
												</p>
												<h3 className="font-serif text-2xl font-black text-white mb-3 line-clamp-1">
													{localizedName}
												</h3>
												<div className="flex items-center gap-2 text-white/60 text-[9px] font-bold uppercase tracking-widest">
													<span className="material-symbols-outlined text-sm">visibility</span>
													<span>Details</span>
												</div>
											</div>
										</div>
									</Link>
								);
							})}
						</div>

						{/* Load More Button */}
						{pagination && pagination.page < pagination.totalPages && (
							<div className="mt-20 flex justify-center">
								<button 
									onClick={loadMore}
									disabled={loadingMore}
									className="px-12 py-5 bg-surface-container-high text-primary rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-on-primary transition-all shadow-lg active:scale-95 disabled:opacity-50"
								>
									{loadingMore ? "Unlocking Archives..." : "Load More Chronicles"}
								</button>
							</div>
						)}
					</>
				) : (
					<div className="py-32 text-center bg-surface-container-low rounded-[3rem] border-2 border-dashed border-surface-container">
						<span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-6 font-thin">explore_off</span>
						<h3 className="font-serif text-2xl font-black text-on-surface mb-2">No Echoes Detected</h3>
						<p className="text-on-surface-variant max-w-sm mx-auto uppercase tracking-widest text-[10px] font-bold">
							We couldn't find any monuments matching your search criteria.
						</p>
					</div>
				)}
			</div>
		</main>
	);
}
