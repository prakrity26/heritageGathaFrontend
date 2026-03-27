// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================
// API: GET /api/v1/admin/ml/diagnostics/:jobId
// Description: Fetches the vision model's layer-by-layer diagnostic report for a specific image prediction.
// Response: { jobId: "x1", confidence: 0.94, predicted: "Konark Sun Temple", features: [...] }

export default function AnalyzingMonument() {
	return (
		<main className="p-8 lg:p-12">
			{/* Header */}
			<div className="mb-12">
				<h1 className="font-serif text-5xl font-black text-on-background tracking-tight mb-2">
					System Status
				</h1>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
					<p className="text-on-surface-variant font-bold">
						CNN Analyzing...
					</p>
				</div>
			</div>

			{/* Scanning Area */}
			<div className="relative w-full aspect-video bg-stone-800 rounded-2xl overflow-hidden mb-12">
				{/* Background Texture */}
				<div className="absolute inset-0 bg-stone-900/80"></div>

				{/* Scanner Line */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div
						className="w-full h-1 animate-pulse"
						style={{
							background:
								"linear-gradient(90deg, transparent, #fed65b, transparent)",
							boxShadow: "0 0 15px #fed65b",
						}}
					></div>
				</div>

				{/* Detection Circles */}
				<div className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-secondary/60 rounded-full flex items-center justify-center">
					<div className="text-white text-sm font-bold text-center">
						OGIVAL ARCH
						<br />
						DETECTED
					</div>
				</div>

				<div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-2 border-secondary/60 rounded-full flex items-center justify-center">
					<div className="text-white text-sm font-bold text-center">
						DORIC COLUMN
						<br />
						VARIANT
					</div>
				</div>

				{/* Loading Indicator */}
				<div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface-container/90 p-8 rounded-xl backdrop-blur-sm">
					<div className="text-center">
						<h3 className="font-serif text-white text-xl font-bold mb-2">
							Heritage Engine v4.2
						</h3>
						<p className="text-white/70 text-xs uppercase tracking-wider mb-4 font-body">
							Neural Network Cross-Referencing
						</p>
						<div className="w-48 h-2 bg-surface-container-low rounded-full overflow-hidden">
							<div className="h-full w-4/5 bg-gradient-to-r from-secondary to-secondary-container rounded-full"></div>
						</div>
						<p className="text-secondary font-bold text-sm mt-2 font-body">
							84%
						</p>
					</div>
				</div>
			</div>

			{/* Analysis Results */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Detection Results */}
				<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg border border-surface-container">
					<h2 className="font-serif text-2xl font-bold text-on-surface mb-6">
						Analysis Results
					</h2>
					<div className="space-y-3">
						<div className="p-4 bg-secondary-container/20 border-l-4 border-secondary rounded">
							<p className="font-bold text-on-surface">
								Geometry
							</p>
							<p className="text-sm text-on-surface-variant">
								Structure Verified
							</p>
						</div>
						<div className="p-4 bg-secondary-container/20 border-l-4 border-secondary rounded">
							<p className="font-bold text-on-surface">Epoch</p>
							<p className="text-sm text-on-surface-variant">
								16th Century Est.
							</p>
						</div>
						<div className="p-4 bg-primary/10 border-l-4 border-primary rounded">
							<p className="font-bold text-on-surface">
								Confidence
							</p>
							<p className="text-sm text-on-surface-variant text-primary font-bold">
								94% Match
							</p>
						</div>
					</div>
				</div>

				{/* Identified Monument */}
				<div className="bg-surface-container-lowest p-6 rounded-xl shadow-lg border border-surface-container">
					<h2 className="font-serif text-2xl font-bold text-on-surface mb-6">
						Identified Monument
					</h2>
					<div className="space-y-3">
						<div className="aspect-video bg-surface-container rounded-lg flex items-center justify-center mb-4">
							<span className="material-symbols-outlined text-on-surface-variant text-6xl">
								account_balance
							</span>
						</div>
						<div className="p-3 bg-primary/10 rounded-lg border border-primary">
							<p className="font-serif font-bold text-on-surface text-lg">
								Konark Sun Temple
							</p>
							<p className="text-sm text-on-surface-variant">
								Konark, Odisha, India
							</p>
						</div>
						<button className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
							<span className="material-symbols-outlined">
								check_circle
							</span>
							Confirm & Archive
						</button>
					</div>
				</div>
			</div>

			{/* Flag for Review */}
			<div className="mt-12 p-6 bg-error-container border-l-4 border-error rounded-xl">
				<div className="flex items-start gap-4">
					<span className="material-symbols-outlined text-error text-2xl">
						warning
					</span>
					<div>
						<p className="font-bold text-on-error">
							Schema Mismatch Detected
						</p>
						<p className="text-sm text-on-error/90 mt-1">
							The detected monument has architectural features
							inconsistent with the database record. Review
							recommended before archival.
						</p>
						<button className="mt-3 underline text-on-error font-bold text-sm hover:no-underline">
							Review Details
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
