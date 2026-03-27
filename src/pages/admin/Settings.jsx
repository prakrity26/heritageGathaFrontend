// ============================================================================
// EXPECTED API CONTRACTS (FOR BACKEND TEAM)
// ============================================================================
// API: GET /api/v1/admin/settings
// API: PUT /api/v1/admin/settings

export default function Settings() {
	return (
		<main className="p-8 lg:p-12">
			<div className="max-w-3xl mb-12">
				<h1 className="font-serif text-5xl font-black text-on-background tracking-tight mb-2">
					Platform Settings
				</h1>
				<p className="text-on-surface-variant font-bold text-lg">
					Configure system behaviors, models, and administrative
					controls.
				</p>
			</div>

			<div className="max-w-4xl space-y-8">
				{/* Neural Network Controls */}
				<section className="bg-surface-container-lowest p-6 rounded-xl shadow-lg border border-surface-container">
					<h2 className="font-serif text-2xl font-bold text-on-surface mb-6 border-b border-surface-container pb-4">
						AI Model Configuration
					</h2>
					<div className="space-y-6">
						<div>
							<label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">
								Vision Model Endpoint (CNN)
							</label>
							<input
								type="text"
								defaultValue="https://ml-api.heritagegatha.com/v1/vision"
								className="w-full px-4 py-3 bg-surface-container-low border border-outline text-on-surface focus:border-primary rounded-lg focus:outline-none transition-colors"
							/>
						</div>
						<div>
							<label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">
								XTTS Synthesis Endpoint
							</label>
							<input
								type="text"
								defaultValue="https://ml-api.heritagegatha.com/v1/xtts"
								className="w-full px-4 py-3 bg-surface-container-low border border-outline text-on-surface focus:border-primary rounded-lg focus:outline-none transition-colors"
							/>
						</div>
						<div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
							<div>
								<p className="font-bold text-on-surface">
									Auto-Archive High Confidence Scans
								</p>
								<p className="text-xs text-on-surface-variant mt-1">
									Automatically save user scans if CNN match
									is above 95%
								</p>
							</div>
							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									className="sr-only peer"
									defaultChecked
								/>
								<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
							</label>
						</div>
					</div>
				</section>

				{/* Storage Limits */}
				<section className="bg-surface-container-lowest p-6 rounded-xl shadow-lg border border-surface-container">
					<h2 className="font-serif text-2xl font-bold text-on-surface mb-6 border-b border-surface-container pb-4">
						Storage & Data
					</h2>
					<div className="grid grid-cols-2 gap-6">
						<div className="p-4 bg-surface-container-low rounded-lg">
							<p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">
								Audio Cache
							</p>
							<div className="flex items-end gap-2">
								<p className="font-serif text-3xl font-bold text-on-surface">
									14.2
								</p>
								<p className="text-sm text-on-surface-variant mb-1">
									GB
								</p>
							</div>
							<button className="mt-4 text-error text-xs font-bold hover:underline">
								Clear Cache
							</button>
						</div>
						<div className="p-4 bg-surface-container-low rounded-lg">
							<p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">
								Scan Artifacts
							</p>
							<div className="flex items-end gap-2">
								<p className="font-serif text-3xl font-bold text-on-surface">
									45.8
								</p>
								<p className="text-sm text-on-surface-variant mb-1">
									GB
								</p>
							</div>
							<button className="mt-4 text-primary text-xs font-bold hover:underline">
								Export Artifacts
							</button>
						</div>
					</div>
				</section>

				<div className="flex justify-end gap-4">
					<button className="px-6 py-3 text-on-surface font-bold hover:bg-surface-container rounded-lg transition-all">
						Discard Changes
					</button>
					<button className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg">
						Save Configuration
					</button>
				</div>
			</div>
		</main>
	);
}
