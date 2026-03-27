import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";

// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================

// API: GET /api/v1/monuments/:id
// Description: Fetches the primary details of a monument by its ID.
// Security: Publicly accessible (no JWT required)
const mockMonumentData = {
	id: "krishna-mandir",
	name: "Krishna Mandir",
	address: "Patan",
	shortDescription:
		"A 17th-century masterpiece of stone architecture, dedicated to Lord Krishna, standing as the crown jewel of Patan Durbar Square.",
	scansToday: 2450,
	identificationStatus: "Identification Confirmed",
	featuredQuote: "The only temple in Nepal having 21 golden pinnacles.",
	historicalContext: [
		"Built in 1657 by King Siddhinarasimha Malla, Krishna Mandir is built in the Shikhara style. Unlike most temples in the region which are multi-roofed pagodas, this structure is made entirely of stone and features an open pavilion inside.",
		"The first floor of the temple contains stone carvings of scenes from the Mahabharata and Ramayana. These carvings serve as a visual liturgy for pilgrims who may not have been literate in Sanskrit, the language of the scriptures.",
	],
	audioNarrative: {
		title: "The Architecture of the Gods",
		duration: "15:20",
		language: "English",
	},
	rating: 4.2,
	metadata: {
		preciseLocation: "Patan Durbar Square",
		coordinates: "27.6°N, 85.3°E",
		constructionEra: "17th Century (1657)",
	},
};

// API: GET /api/v1/monuments/:id/nearby
// Description: Fetches a list of nearby monuments based on proximity.
// Security: Publicly accessible (no JWT required)
const mockNearbyMonuments = [
	{
		id: "taleju-bell",
		name: "Taleju Bell",
		distance: "2.1 km away",
	},
	{
		id: "hiranya-varna-mahavihar",
		name: "Hiranya Varna Mahavihar",
		distance: "1.8 km away",
	},
];

export default function MonumentDetail() {
	const { id } = useParams();
	const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

	// In the future, this state will be populated by API calls:
	// const [monument, setMonument] = useState(null)
	// const [nearbyMonuments, setNearbyMonuments] = useState([])

	// Using mock data for now based on the backend contract
	const monument = mockMonumentData;
	const nearby = mockNearbyMonuments;

	return (
		<main className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
			{/* Header Section with Asymmetry */}
			<header className="mb-12 relative">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div className="max-w-2xl">
						<span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
							{monument.identificationStatus}
						</span>
						<h1 className="font-serif text-5xl md:text-6xl font-bold text-primary tracking-tight leading-tight">
							{monument.name}, {monument.address}
						</h1>
						<p className="mt-4 text-on-surface-variant text-lg max-w-xl">
							{monument.shortDescription}
						</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-right">
							<div className="text-2xl font-serif font-bold text-on-surface">
								{monument.scansToday.toLocaleString()}
							</div>
							<div className="text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant">
								Scans Today
							</div>
						</div>
						<div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
							<span className="material-symbols-outlined text-primary">
								trending_up
							</span>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
				{/* Main Column */}
				<div className="lg:col-span-2 space-y-8">
					{/* Image Carousel */}
					<section className="relative">
						<div className="bg-surface-container-high rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
							<span className="material-symbols-outlined text-on-surface-variant text-6xl">
								image
							</span>
						</div>
						<div className="absolute bottom-6 left-6 glass-panel px-6 py-4 rounded-xl border border-white/20 shadow-lg hidden md:block">
							<p className="font-serif text-sm italic text-white">
								"{monument.featuredQuote}"
							</p>
						</div>
					</section>

					{/* Historical Context */}
					<section className="space-y-4">
						<h2 className="font-serif text-3xl font-bold text-on-surface">
							Historical Context
						</h2>
						{monument.historicalContext.map((paragraph, idx) => (
							<p
								key={idx}
								className="text-on-surface-variant font-body leading-relaxed"
							>
								{paragraph}
							</p>
						))}
					</section>

					{/* Audio Narrative */}
					<section className="space-y-4 bg-surface-container-low p-6 rounded-xl border border-surface-container">
						<div className="flex items-center gap-3">
							<span className="material-symbols-outlined text-primary text-2xl">
								play_circle
							</span>
							<div>
								<h3 className="font-bold text-on-surface font-body">
									Audio Narrative
								</h3>
								<p className="text-xs text-on-surface-variant font-body">
									{monument.audioNarrative.title} (
									{monument.audioNarrative.duration})
								</p>
							</div>
						</div>
						<div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
							<div className="h-full w-1/3 bg-primary rounded-full"></div>
						</div>
						<button className="text-primary font-bold text-sm font-body">
							{monument.audioNarrative.language}
						</button>
					</section>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Rating Section */}
					<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg space-y-4">
						<div className="text-center">
							<div className="text-3xl font-bold text-on-surface">
								{monument.rating.toFixed(1)}
							</div>
							<p className="text-xs text-on-surface-variant font-body uppercase tracking-wider">
								out of 5.0
							</p>
							<div className="flex justify-center gap-1 mt-2">
								{[...Array(5)].map((_, i) => (
									<span
										key={i}
										className={`material-symbols-outlined text-2xl ${
											i < Math.floor(monument.rating)
												? "text-secondary"
												: "text-outline"
										}`}
									>
										star
									</span>
								))}
							</div>
						</div>
						<Link
							to={
								isLoggedIn
									? `/monument/${id}/feedback`
									: `/login`
							}
							state={{ returnUrl: `/monument/${id}/feedback` }}
							className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all text-center"
						>
							{isLoggedIn ? "Rate & Review" : "Login to Review"}
							{!isLoggedIn && (
								<span className="material-symbols-outlined text-sm">
									lock
								</span>
							)}
						</Link>
					</div>

					{/* Location Info */}
					<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg space-y-3">
						<h3 className="font-bold text-on-surface font-body">
							Location Metadata
						</h3>
						<div className="flex gap-2">
							<span className="material-symbols-outlined text-primary">
								location_on
							</span>
							<div>
								<p className="text-sm font-body text-on-surface">
									{monument.metadata.preciseLocation}
								</p>
								<p className="text-xs text-on-surface-variant font-body">
									{monument.metadata.coordinates}
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<span className="material-symbols-outlined text-primary">
								calendar_today
							</span>
							<div>
								<p className="text-sm font-body text-on-surface">
									Construction Era
								</p>
								<p className="text-xs text-on-surface-variant font-body">
									{monument.metadata.constructionEra}
								</p>
							</div>
						</div>
					</div>

					{/* Nearby Monuments */}
					<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg space-y-3">
						<h3 className="font-bold text-on-surface font-body">
							Nearby Monuments
						</h3>
						{nearby.map((item) => (
							<Link
								key={item.id}
								to={`/monument/${item.id}`}
								className="w-full p-3 text-left border border-surface-container rounded-lg hover:bg-surface-container transition-all block"
							>
								<p className="text-sm font-bold text-on-surface">
									{item.name}
								</p>
								<p className="text-xs text-on-surface-variant">
									{item.distance}
								</p>
							</Link>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
