import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import monumentService from "../services/monument.service";
import { toast } from "react-hot-toast";

export default function MonumentDetail() {
	const { id } = useParams();
	const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
	const selectedLanguage = useSelector((state) => state.language.language);

	const [monument, setMonument] = useState(null);
	const [nearby, setNearby] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	
	// Audio State
	const [currentAudio, setCurrentAudio] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const audioRef = useRef(new Audio());

	useEffect(() => {
		const audio = audioRef.current;
		
		const updateProgress = () => {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100);
			}
		};

		const handleEnded = () => {
			setIsPlaying(false);
			setProgress(0);
		};

		audio.addEventListener("timeupdate", updateProgress);
		audio.addEventListener("ended", handleEnded);

		return () => {
			audio.pause();
			audio.removeEventListener("timeupdate", updateProgress);
			audio.removeEventListener("ended", handleEnded);
		};
	}, []);

	const handlePlayAudio = (audioUrl) => {
		if (currentAudio === audioUrl) {
			if (isPlaying) {
				audioRef.current.pause();
				setIsPlaying(false);
			} else {
				audioRef.current.play();
				setIsPlaying(true);
			}
		} else {
			audioRef.current.src = audioUrl;
			audioRef.current.play();
			setCurrentAudio(audioUrl);
			setIsPlaying(true);
		}
	};

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await monumentService.getMonumentById(id);
				if (res.success) {
					setMonument(res.data);
					// Fetch nearby if we have coordinates
					if (res.data.latitude && res.data.longitude) {
						const nearbyRes = await monumentService.getNearbyMonuments(res.data.latitude, res.data.longitude);
						if (nearbyRes.success) {
							setNearby(nearbyRes.data.filter(m => m.id !== id));
						}
					}
				} else {
					setError(res.message || "Failed to load monument");
				}
			} catch (err) {
				setError("An unexpected error occurred");
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [id, selectedLanguage]);

	if (loading) return (
		<div className="min-h-screen flex items-center justify-center bg-surface">
			<div className="flex flex-col items-center gap-4">
				<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
				<p className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">Syncing Archivist Data...</p>
			</div>
		</div>
	);

	if (error || !monument) return (
		<div className="min-h-screen flex items-center justify-center p-6 text-center">
			<div>
				<span className="material-symbols-outlined text-6xl text-error/30 mb-4 font-thin">error</span>
				<h2 className="font-serif text-2xl font-black text-on-surface mb-2">Narrative Interrupted</h2>
				<p className="text-sm text-on-surface-variant mb-6">{error || "The requested site is not in our archives."}</p>
				<Link to="/" className="px-6 py-3 bg-primary text-on-primary rounded-xl font-black uppercase tracking-widest text-xs">Return Home</Link>
			</div>
		</div>
	);

	// Multi-language Selection Logic
	const localizedName = selectedLanguage === 'hi' ? (monument.name_hi || monument.name) : 
						 selectedLanguage === 'ne' ? (monument.name_ne || monument.name) : 
						 monument.name;

	const localizedDescription = selectedLanguage === 'hi' ? (monument.description_hi || monument.description) : 
								selectedLanguage === 'ne' ? (monument.description_ne || monument.description) : 
								monument.description;

	return (
		<main className="bg-surface min-h-screen pb-20">
			{/* Mobile Hero Gallery */}
			<div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-surface-container-high">
				{monument.images && monument.images.length > 0 ? (
					<img 
						src={monument.images.find(img => img.is_primary)?.url || monument.images[0].url} 
						alt={localizedName}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center opacity-20">
						<span className="material-symbols-outlined text-8xl font-thin">image</span>
						<p className="text-xs font-black uppercase tracking-[0.2em] mt-4">Visual Asset Missing</p>
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
				
				{/* Top Actions */}
				<div className="absolute top-20 inset-x-6 flex justify-between items-start pointer-events-none">
					<button 
						onClick={() => window.history.back()}
						className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface shadow-lg pointer-events-auto"
					>
						<span className="material-symbols-outlined">arrow_back</span>
					</button>
					<div className="flex flex-col gap-2 pointer-events-auto">
						<button className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface shadow-lg">
							<span className="material-symbols-outlined text-xl">share</span>
						</button>
						<button className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface shadow-lg">
							<span className="material-symbols-outlined text-xl">favorite</span>
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-20 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
					
					{/* Main Narrative Column */}
					<div className="lg:col-span-2 space-y-12">
						{/* Title Section */}
						<div>
							<div className="flex items-center gap-3 mb-4">
								<span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-black uppercase tracking-widest border border-secondary/20">
									{monument.era || "Historical Asset"}
								</span>
								<span className="w-1 h-1 rounded-full bg-on-surface-variant/30"></span>
								<span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
									<span className="material-symbols-outlined text-sm">location_on</span>
									Heritage Zone
								</span>
							</div>
							<h1 className="font-serif text-5xl md:text-7xl font-black text-on-surface tracking-tight leading-tight mb-6">
								{localizedName}
							</h1>
							
							{/* Rapid Insights Grid */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-surface-container-lowest rounded-[2.5rem] border border-surface-container shadow-sm">
								<div className="text-center md:border-r border-surface-container">
									<p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Global Scans</p>
									<p className="text-xl font-serif font-black text-primary">{(monument.totalScans || 0).toLocaleString()}</p>
								</div>
								<div className="text-center md:border-r border-surface-container">
									<p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Avg Rating</p>
									<p className="text-xl font-serif font-black text-primary">{(monument.averageRating || 0).toFixed(1)}</p>
								</div>
								<div className="text-center md:border-r border-surface-container">
									<p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Reviews</p>
									<p className="text-xl font-serif font-black text-primary">{monument.reviewCount || 0}</p>
								</div>
								<div className="text-center">
									<p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Era</p>
									<p className="text-xl font-serif font-black text-primary truncate px-2">{monument.era?.split(' ')[0] || "Ancient"}</p>
								</div>
							</div>
						</div>

						{/* Audio Synthesis Section */}
						{monument.audio_assets && monument.audio_assets.length > 0 && (
							<section className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container shadow-sm group">
								<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
									<div className="flex items-center gap-4">
										<div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
											<span className={`material-symbols-outlined text-3xl ${isPlaying ? "animate-pulse" : ""}`}>
												{isPlaying ? "graphic_eq" : "play_circle"}
											</span>
										</div>
										<div>
											<h3 className="font-serif text-2xl font-black text-on-surface">Oral Tradition</h3>
											<p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Neural Narrative Suite</p>
										</div>
									</div>
									<div className="flex gap-2 bg-surface-container-lowest p-1.5 rounded-xl border border-surface-container">
										{monument.audio_assets.map(audio => (
											<button 
												key={audio.id}
												onClick={() => handlePlayAudio(audio.file_url)}
												className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
													currentAudio === audio.file_url 
														? "bg-primary text-on-primary shadow-md" 
														: "hover:bg-surface-container-high text-on-surface-variant"
												}`}
											>
												{audio.language === "en" ? "EN" : audio.language === "ne" ? "NE" : "HI"}
											</button>
										))}
									</div>
								</div>

								{/* Audio Progress */}
								<div className="space-y-3">
									<div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
										<div 
											className="h-full bg-primary transition-all duration-300"
											style={{ width: `${progress}%` }}
										></div>
									</div>
									<div className="flex justify-between text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
										<span>Narrating Live</span>
										<span>Neural Sync Active</span>
									</div>
								</div>
							</section>
						)}

						{/* Detailed Narrative */}
						<section className="space-y-8">
							<div className="flex items-center gap-4">
								<h2 className="font-serif text-3xl font-black text-on-surface">The Chronicle</h2>
								<div className="h-[2px] flex-1 bg-surface-container"></div>
							</div>
							<div className="prose prose-stone max-w-none">
								{localizedDescription?.split("\n").map((paragraph, idx) => (
									<p key={idx} className="text-on-surface-variant text-lg leading-relaxed font-body mb-6 last:mb-0">
										{paragraph}
									</p>
								))}
							</div>
						</section>

						{/* Heritage Gallery */}
						{monument.images && monument.images.length > 1 && (
							<section className="space-y-8">
								<h2 className="font-serif text-3xl font-black text-on-surface">Visual Conservatory</h2>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{monument.images.filter(img => !img.is_primary).map((img, idx) => (
										<div key={idx} className="aspect-square rounded-[2rem] overflow-hidden border border-surface-container shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
											<img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={`Gallery ${idx}`} />
										</div>
									))}
								</div>
							</section>
						)}
					</div>

					{/* Sidebar / Context Column */}
					<div className="space-y-8">
						{/* Feedback Card */}
						<section className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container shadow-sm text-center">
							<p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Community Reverence</p>
							<div className="text-5xl font-serif font-black text-primary mb-2">{(monument.averageRating || 0).toFixed(1)}</div>
							<div className="flex justify-center gap-1 mb-2">
								{[1, 2, 3, 4, 5].map(i => (
									<span key={i} className={`material-symbols-outlined text-secondary text-2xl font-bold ${i <= Math.round(monument.averageRating || 0) ? "filled" : "opacity-20"}`}>star</span>
								))}
							</div>
							<p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-8 opacity-60">Based on {monument.reviewCount || 0} chronicles</p>
							<Link
								to={isLoggedIn ? `/monument/${id}/feedback` : `/login`}
								state={{ returnUrl: `/monument/${id}/feedback` }}
								className="block w-full py-4 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
							>
								{isLoggedIn ? "Add Your Chronicle" : "Login to Review"}
							</Link>
						</section>

						{/* Coordinates Card */}
						<section className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container shadow-sm space-y-6">
							<h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
								<span className="material-symbols-outlined text-sm">explore</span>
								Navigation Core
							</h3>
							<div className="space-y-4">
								<div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-surface-container">
									<span className="material-symbols-outlined text-primary">location_on</span>
									<div>
										<p className="text-sm font-black text-on-surface uppercase tracking-widest">{monument.latitude.toFixed(4)}</p>
										<p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Latitude Precision</p>
									</div>
								</div>
								<div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-surface-container">
									<span className="material-symbols-outlined text-primary">explore</span>
									<div>
										<p className="text-sm font-black text-on-surface uppercase tracking-widest">{monument.longitude.toFixed(4)}</p>
										<p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Longitude Precision</p>
									</div>
								</div>
							</div>
						</section>

						{/* Nearby Heritage */}
						{nearby.length > 0 && (
							<section className="bg-surface-container-low p-8 rounded-[2.5rem] border border-surface-container shadow-sm space-y-8">
								<h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Nearby Echoes</h3>
								<div className="space-y-4">
									{nearby.map((item) => (
										<Link
											key={item.id}
											to={`/monument/${item.id}`}
											className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-surface-container hover:border-primary/40 hover:shadow-lg transition-all group"
										>
											<div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
												<span className="material-symbols-outlined text-xl">account_balance</span>
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-black text-on-surface truncate uppercase tracking-widest">
													{selectedLanguage === 'hi' ? (item.name_hi || item.name) : 
													 selectedLanguage === 'ne' ? (item.name_ne || item.name) : 
													 item.name}
												</p>
												<p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">{item.era || "Nearby"}</p>
											</div>
										</Link>
									))}
								</div>
							</section>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
