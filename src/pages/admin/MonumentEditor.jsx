import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================
// API: GET /api/v1/admin/monuments/:id
// Description: Load a monument to edit. (Returns 404 if "new")
//
// API: POST /api/v1/admin/monuments
// Description: Create a new monument record.
//
// API: PUT /api/v1/admin/monuments/:id
// Description: Updates text, status, metadata of existing monument.
//
// API: POST /api/v1/admin/xtts/generate
// Description: Submits the `description` string and requested `languages`
//              array to the XTTS engine to produce audio files.
// Request Example: { monumentId: "m1", text: "...", languages: ["English", "Nepali"] }

export default function MonumentEditor() {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const isNew = !id;

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState("live");
	const [coordinates, setCoordinates] = useState("");
	const [address, setAddress] = useState("");
	const [era, setEra] = useState("");

	useEffect(() => {
		if (isNew) {
			setTitle("");
			setDescription("");
			setCoordinates("");
			setAddress("");
			setEra("");
		} else {
			// If we passed the monument data through router state (from MonumentManagement list)
			if (location.state?.monument) {
				setTitle(location.state.monument.name);
				setAddress(location.state.monument.location);
				setCoordinates("");
				setEra("");
				setStatus(location.state.monument.status);
				setDescription(
					`Mock description for ${location.state.monument.name}. A completely customizable section for administrators to drop their historical data into.`,
				);
			} else {
				// Fallback if accessed directly via URL instead of clicking the table
				setTitle("Patan Durbar Square");
				setDescription(
					"A 17th-century masterpiece of stone architecture, dedicated to Lord Krishna...",
				);
			}
		}
	}, [id, isNew, location.state]);

	// Audio Generation State
	const [showAudioPopup, setShowAudioPopup] = useState(false);
	const [selectedLangs, setSelectedLangs] = useState({
		English: true,
		Nepali: false,
		Hindi: false,
	});
	const [isGenerating, setIsGenerating] = useState(false);
	const [audioFiles, setAudioFiles] = useState([
		{ name: "English_Narrative_v2.mp3", status: "GENERATED", id: "a1" },
		{ name: "Nepali_Narrative_v1.mp3", status: "PROCESSING", id: "a2" },
	]);

	const handleGenerateAudio = async () => {
		setIsGenerating(true);

		// Map the selected languages to mock pending files
		const newFiles = Object.entries(selectedLangs)
			.filter(([_, isSelected]) => isSelected)
			.map(([lang]) => ({
				name: `${lang}_Narrative_${Date.now().toString().slice(-4)}.mp3`,
				status: "PROCESSING",
				id: Math.random().toString(),
			}));

		setAudioFiles([...audioFiles, ...newFiles]);
		setShowAudioPopup(false);

		// Simulate the XTTS Backend Model delay
		setTimeout(() => {
			setIsGenerating(false);
			setAudioFiles((prev) =>
				prev.map((f) =>
					newFiles.find((n) => n.id === f.id) ||
					f.status === "PROCESSING"
						? { ...f, status: "GENERATED" }
						: f,
				),
			);
		}, 3000);
	};

	const handleDeleteAudio = (audioId) => {
		setAudioFiles(audioFiles.filter((a) => a.id !== audioId));
	};

	return (
		<main className="p-8 lg:p-12">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
				<div className="max-w-3xl">
					<h1 className="font-serif text-3xl font-bold text-primary mb-2">
						{isNew ? "Create Monument" : "Editing Mode"}
					</h1>
					<p className="text-on-surface-variant font-body">
						{isNew
							? "Add a new heritage site"
							: title || `Monument #${id}`}
					</p>
				</div>
				<div className="flex gap-4">
					<button className="px-4 py-2 bg-surface-container text-on-surface rounded-lg font-bold hover:bg-surface-container-high transition-all">
						Discard Changes
					</button>
					<button className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2">
						<span className="material-symbols-outlined">
							publish
						</span>
						Publish to Portal
					</button>
				</div>
			</div>

			{/* Form Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-8">
					{/* Historical Narrative */}
					<section className="bg-surface-container-lowest p-6 rounded-xl shadow-lg border border-surface-container">
						<div className="flex items-center gap-3 mb-6">
							<span className="material-symbols-outlined text-primary">
								description
							</span>
							<h2 className="font-serif text-2xl font-bold text-on-surface">
								Historical Narrative
							</h2>
						</div>

						<div className="space-y-4">
							<div>
								<label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">
									Monument Title
								</label>
								<input
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface focus:border-primary focus:outline-none transition-colors font-body"
								/>
							</div>

							<div>
								<label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">
									Full Description
								</label>
								<div className="flex gap-4 mb-2">
									<label className="cursor-pointer px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-2">
										<span className="material-symbols-outlined text-sm">
											upload_file
										</span>
										Upload .txt File
										<input
											type="file"
											accept=".txt"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files[0];
												if (file) {
													const reader =
														new FileReader();
													reader.onload = (event) =>
														setDescription(
															event.target.result,
														);
													reader.readAsText(file);
												}
											}}
										/>
									</label>
								</div>
								<textarea
									value={description}
									onChange={(e) =>
										setDescription(e.target.value)
									}
									className="w-full px-4 py-3 bg-surface-container-low border-b-2 border-outline text-on-surface focus:border-primary focus:outline-none resize-none h-40 transition-colors font-body"
								/>
								<p className="text-xs text-on-surface-variant mt-2">
									{description.length} characters
								</p>
							</div>
						</div>
					</section>

					{/* Media Library */}
					<section className="bg-surface-container-lowest p-6 rounded-xl shadow-lg border border-surface-container">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<span className="material-symbols-outlined text-primary">
									image
								</span>
								<h2 className="font-serif text-2xl font-bold text-on-surface">
									Media Library
								</h2>
							</div>
							<button className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-2">
								<span className="material-symbols-outlined text-lg">
									add
								</span>
								Add
							</button>
						</div>

						<div className="grid grid-cols-2 gap-4">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="relative aspect-video bg-surface-container rounded-lg overflow-hidden group cursor-pointer"
								>
									<div className="w-full h-full flex items-center justify-center">
										<span className="material-symbols-outlined text-on-surface-variant text-4xl">
											image
										</span>
									</div>
									<button className="absolute top-2 right-2 p-2 bg-error text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
										<span className="material-symbols-outlined text-sm">
											delete
										</span>
									</button>
								</div>
							))}
						</div>
					</section>

					{/* Multilingual Audio Assets */}
					<section className="bg-surface-container-lowest p-6 rounded-xl shadow-lg border border-surface-container">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<span className="material-symbols-outlined text-primary">
									music_note
								</span>
								<h2 className="font-serif text-2xl font-bold text-on-surface">
									Multilingual Audio Assets
								</h2>
							</div>
							<p className="text-xs text-on-surface-variant font-body">
								Manage AI-synthesized heritage guides
							</p>
						</div>

						<div className="space-y-3">
							{audioFiles.map((audio) => (
								<div
									key={audio.id}
									className="flex items-center justify-between p-3 bg-surface-container rounded-lg"
								>
									<div className="flex items-center gap-3">
										<span
											className={`material-symbols-outlined ${audio.status === "GENERATED" ? "text-primary" : "text-on-surface-variant animate-pulse"}`}
										>
											{audio.status === "GENERATED"
												? "play_circle"
												: "sync"}
										</span>
										<div>
											<p className="text-sm font-bold text-on-surface">
												{audio.name}
											</p>
											<p className="text-xs text-on-surface-variant font-body">
												{audio.status}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{audio.status === "GENERATED" && (
											<button
												className="p-2 text-primary hover:bg-primary-container rounded transition-all"
												title="Listen"
											>
												<span className="material-symbols-outlined text-sm">
													volume_up
												</span>
											</button>
										)}
										<button
											onClick={() =>
												handleDeleteAudio(audio.id)
											}
											className="p-2 text-error hover:bg-error-container rounded transition-all"
											title="Delete"
										>
											<span className="material-symbols-outlined text-sm">
												delete
											</span>
										</button>
									</div>
								</div>
							))}
							{audioFiles.length === 0 && (
								<p className="text-sm text-on-surface-variant text-center py-4">
									No audio files generated yet.
								</p>
							)}
						</div>

						<button
							onClick={() => setShowAudioPopup(true)}
							className="w-full mt-4 py-3 border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
						>
							<span className="material-symbols-outlined">
								graphic_eq
							</span>
							Generate Audio (XTTS)
						</button>
					</section>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Location Info */}
					<section className="bg-surface-container-lowest p-6 rounded-xl shadow-lg">
						<h3 className="font-serif font-bold text-on-surface mb-4">
							Location Metadata
						</h3>
						<div className="space-y-4">
							<div>
								<label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1 block">
									Long/Lat Coordinates
								</label>
								<input
									type="text"
									value={coordinates}
									onChange={(e) =>
										setCoordinates(e.target.value)
									}
									placeholder="e.g. 27.1751° N, 78.0421° E"
									className="w-full px-3 py-2 bg-surface-container-low border-b border-outline text-on-surface text-sm focus:border-primary focus:outline-none transition-colors"
								/>
							</div>
							<div>
								<label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1 block">
									Physical Address
								</label>
								<input
									type="text"
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									placeholder="e.g. Agra, UP"
									className="w-full px-3 py-2 bg-surface-container-low border-b border-outline text-on-surface text-sm focus:border-primary focus:outline-none transition-colors"
								/>
							</div>
							<div>
								<label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1 block">
									Historical Era
								</label>
								<input
									type="text"
									value={era}
									onChange={(e) => setEra(e.target.value)}
									placeholder="e.g. 17th Century Est."
									className="w-full px-3 py-2 bg-surface-container-low border-b border-outline text-on-surface text-sm focus:border-primary focus:outline-none transition-colors"
								/>
							</div>
						</div>
					</section>

					{/* Status */}
					<section className="bg-surface-container-lowest p-6 rounded-xl shadow-lg">
						<h3 className="font-serif font-bold text-on-surface mb-4">
							Publication Status
						</h3>
						<div className="space-y-2">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="status"
									checked={status === "live"}
									onChange={() => setStatus("live")}
									className="w-4 h-4 accent-primary"
								/>
								<span className="text-sm text-on-surface font-body">
									Live
								</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="status"
									checked={
										status === "draft" ||
										status === "needs-audio"
									}
									onChange={() => setStatus("draft")}
									className="w-4 h-4 accent-primary"
								/>
								<span className="text-sm text-on-surface font-body">
									Draft
								</span>
							</label>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="status"
									checked={status === "archived"}
									onChange={() => setStatus("archived")}
									className="w-4 h-4 accent-primary"
								/>
								<span className="text-sm text-on-surface font-body">
									Archived
								</span>
							</label>
						</div>
					</section>

					{/* Stats and Reviews Overview */}
					<section className="bg-surface-container-lowest p-6 rounded-xl shadow-lg border-l-4 border-l-secondary">
						<h3 className="font-serif font-bold text-on-surface mb-4 flex items-center gap-2">
							<span className="material-symbols-outlined text-secondary">
								trending_up
							</span>
							Insights
						</h3>
						<div className="space-y-4">
							<div className="flex justify-between items-center bg-surface-container/50 p-3 rounded-lg">
								<span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant font-label">
									Total Scans
								</span>
								<span className="font-bold text-on-surface">
									1,240
								</span>
							</div>
							<div className="flex justify-between items-center bg-surface-container/50 p-3 rounded-lg">
								<span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant font-label">
									Avg. Rating
								</span>
								<div className="flex items-center gap-1 font-bold text-on-surface">
									4.8{" "}
									<span className="material-symbols-outlined text-sm text-secondary">
										star
									</span>
								</div>
							</div>
							<button className="w-full text-center text-xs font-bold text-primary hover:underline font-body pt-2">
								View All Feedback →
							</button>
						</div>
					</section>
				</div>
			</div>

			{/* Audio Generation Popup Modal */}
			{showAudioPopup && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
					<div className="bg-surface p-8 rounded-2xl max-w-sm w-full shadow-2xl">
						<h3 className="font-serif text-2xl font-bold text-on-surface mb-2">
							Select Languages
						</h3>
						<p className="text-sm text-on-surface-variant font-body mb-6">
							Choose the languages to synthesize for the text
							payload using the XTTS-v2 Engine.
						</p>

						<div className="space-y-3 mb-8">
							{["English", "Nepali", "Hindi"].map((lang) => (
								<label
									key={lang}
									className="flex items-center justify-between p-3 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors"
								>
									<span className="font-bold text-on-surface">
										{lang}
									</span>
									<input
										type="checkbox"
										className="w-5 h-5 accent-primary"
										checked={selectedLangs[lang]}
										onChange={() =>
											setSelectedLangs((prev) => ({
												...prev,
												[lang]: !prev[lang],
											}))
										}
									/>
								</label>
							))}
						</div>

						<div className="flex gap-4">
							<button
								onClick={() => setShowAudioPopup(false)}
								className="flex-1 py-3 text-on-surface-variant font-bold hover:bg-surface-container rounded-xl transition-all"
							>
								Cancel
							</button>
							<button
								onClick={handleGenerateAudio}
								disabled={
									!Object.values(selectedLangs).some(Boolean)
								}
								className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
							>
								Generate
								<span className="material-symbols-outlined text-sm">
									memory
								</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
