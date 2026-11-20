export default function Home() {
  return (
    <main className="min-h-screen bg-[#080b12] text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-[#0b0f17] p-6">
          <h1 className="text-2xl font-bold tracking-wide">
            <span className="text-emerald-400">◈</span> DeepShield
          </h1>

          <p className="mt-2 text-xs tracking-widest text-gray-500">
            AI SECURITY INTELLIGENCE
          </p>

          <nav className="mt-12 space-y-2">
            <div className="rounded-xl bg-emerald-400/10 px-4 py-3 text-emerald-400">
              ◫ Dashboard
            </div>

            <div className="px-4 py-3 text-gray-400 hover:text-white">
              ◈ Photo Analysis
            </div>

            <div className="px-4 py-3 text-gray-400 hover:text-white">
              ▣ QR Analysis
            </div>

            <div className="px-4 py-3 text-gray-400 hover:text-white">
              ▤ Document Analysis
            </div>

            <div className="px-4 py-3 text-gray-400 hover:text-white">
              ▷ Video Analysis
            </div>

            <div className="px-4 py-3 text-gray-400 hover:text-white">
              ◉ AI Assistant
            </div>
          </nav>

          <div className="mt-16 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <p className="text-sm font-medium text-emerald-400">
              System Status
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-sm text-gray-400">All systems operational</span>
            </div>
          </div>
        </aside>

        {/* Main Dashboard */}
        <section className="flex-1 p-8">

          {/* Top Bar */}
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Security Dashboard</h2>
              <p className="mt-1 text-sm text-gray-500">
                Welcome to DeepShield AI Intelligence Platform
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-[#111722] px-4 py-2 text-sm text-gray-400">
              ● System Secure
            </div>
          </header>

          {/* Welcome Banner */}
          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 p-8">
            <p className="text-sm font-medium tracking-widest text-emerald-400">
              MULTIMODAL THREAT INTELLIGENCE
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              Analyze. Detect. Protect.
            </h3>

            <p className="mt-3 max-w-2xl text-gray-400">
              Analyze images, documents, QR codes and videos using AI-powered
              security intelligence to identify potentially suspicious content.
            </p>

            <button className="mt-6 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-black transition hover:bg-emerald-300">
              Start New Analysis →
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

            {[
              ["Total Analyses", "1,284", "+12.8%"],
              ["Threats Detected", "86", "Security alerts"],
              ["Safe Files", "1,198", "Successfully analyzed"],
              ["Detection Rate", "96.8%", "AI performance"],
            ].map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-[#101620] p-6 transition hover:border-emerald-400/30"
              >
                <p className="text-sm text-gray-500">{stat[0]}</p>

                <h3 className="mt-3 text-3xl font-bold">{stat[1]}</h3>

                <p className="mt-2 text-sm text-emerald-400">{stat[2]}</p>
              </div>
            ))}
          </div>

          {/* Analysis Modules */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Security Analysis Modules</h3>

              <span className="text-sm text-gray-500">
                Choose an analysis module
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

              {/* Photo */}
              <div className="rounded-2xl border border-white/10 bg-[#101620] p-6 transition hover:-translate-y-1 hover:border-cyan-400/40">
                <div className="text-3xl">◈</div>

                <h4 className="mt-5 text-lg font-semibold">Photo Analysis</h4>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Detect AI-generated images and identify suspicious visual content.
                </p>

                <button className="mt-5 text-sm font-medium text-cyan-400">
                  Analyze Image →
                </button>
              </div>

              {/* QR */}
              <div className="rounded-2xl border border-white/10 bg-[#101620] p-6 transition hover:-translate-y-1 hover:border-emerald-400/40">
                <div className="text-3xl">▣</div>

                <h4 className="mt-5 text-lg font-semibold">QR Analysis</h4>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Inspect QR codes and identify potentially unsafe links or content.
                </p>

                <button className="mt-5 text-sm font-medium text-emerald-400">
                  Scan QR →
                </button>
              </div>

              {/* Document */}
              <div className="rounded-2xl border border-white/10 bg-[#101620] p-6 transition hover:-translate-y-1 hover:border-violet-400/40">
                <div className="text-3xl">▤</div>

                <h4 className="mt-5 text-lg font-semibold">Document Analysis</h4>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Examine documents and extract information for security analysis.
                </p>

                <button className="mt-5 text-sm font-medium text-violet-400">
                  Analyze Document →
                </button>
              </div>

              {/* Video */}
              <div className="rounded-2xl border border-white/10 bg-[#101620] p-6 transition hover:-translate-y-1 hover:border-amber-400/40">
                <div className="text-3xl">▷</div>

                <h4 className="mt-5 text-lg font-semibold">Video Analysis</h4>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Analyze video content for manipulated or potentially synthetic media.
                </p>

                <button className="mt-5 text-sm font-medium text-amber-400">
                  Analyze Video →
                </button>
              </div>

            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">

            <div className="rounded-2xl border border-white/10 bg-[#101620] p-6">
              <h3 className="text-lg font-semibold">AI Security Assistant</h3>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Your intelligent security assistant helps interpret analysis results,
                explain potential risks, and provide security insights.
              </p>

              <button className="mt-5 rounded-lg border border-emerald-400/30 px-4 py-2 text-sm text-emerald-400 transition hover:bg-emerald-400/10">
                Open Assistant →
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101620] p-6">
              <h3 className="text-lg font-semibold">Recent Activity</h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-gray-400">
                    Photo analysis module
                  </span>

                  <span className="text-xs text-emerald-400">Ready</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-gray-400">
                    QR analysis module
                  </span>

                  <span className="text-xs text-emerald-400">Ready</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-sm text-gray-400">
                    Document analysis module
                  </span>

                  <span className="text-xs text-emerald-400">Ready</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Video analysis module
                  </span>

                  <span className="text-xs text-amber-400">Integration Pending</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-gray-600">
            DeepShield AI © 2026 · Multimodal Security Intelligence Platform
          </footer>

        </section>
      </div>
    </main>
  );
}