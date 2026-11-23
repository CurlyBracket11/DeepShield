
import Link from "next/link";
import {
  ArrowUpRight,
  Image,
  QrCode,
  FileText,
  Video,
  Bot,
  ShieldCheck,
  ScanSearch,
  Sparkles,
} from "lucide-react";

const modules = [
  {
    number: "01",
    name: "Photo Analysis",
    description:
      "Examine images for signs of AI generation and potentially manipulated visual content.",
    href: "/photo",
    icon: Image,
    detail: "IMAGE INTELLIGENCE",
  },
  {
    number: "02",
    name: "QR Analysis",
    description:
      "Decode QR codes, inspect embedded destinations and identify suspicious links.",
    href: "/qr",
    icon: QrCode,
    detail: "LINK INSPECTION",
  },
  {
    number: "03",
    name: "Document Analysis",
    description:
      "Extract document information and examine content for potentially suspicious indicators.",
    href: "/document",
    icon: FileText,
    detail: "DOCUMENT FORENSICS",
  },
  {
    number: "04",
    name: "Video Analysis",
    description:
      "Inspect video content for signs of synthetic or manipulated media.",
    href: "/video",
    icon: Video,
    detail: "VIDEO INTELLIGENCE",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10 lg:px-12">

        {/* Page heading */}
        <header className="flex flex-col justify-between gap-5 border-b border-[#dedfd5] pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold tracking-[2.5px] text-[#718174]">
              DEEPSHIELD / WORKSPACE
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-1.2px] text-[#202b23] md:text-[38px]">
              Overview
            </h2>
            <p className="mt-2 text-sm text-[#747c72]">
              Your workspace for multimodal security analysis.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#718174]">
            <span className="h-2 w-2 rounded-full bg-[#91a78b]" />
            Analysis workspace
          </div>
        </header>

        {/* Main introduction */}
        <section className="relative mt-8 overflow-hidden bg-[#e7ebe1]">
          <div className="grid min-h-[330px] lg:grid-cols-[1.35fr_0.65fr]">
            <div className="flex flex-col justify-center px-7 py-10 md:px-12 md:py-14">
              <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[2.2px] text-[#637965]">
                <ShieldCheck size={15} />
                MULTIMODAL THREAT INTELLIGENCE
              </div>

              <h3 className="mt-6 max-w-[600px] text-[38px] font-semibold leading-[1.12] tracking-[-1.8px] text-[#25372b] md:text-[52px]">
                Understand what
                <br />
                you&apos;re looking at.
              </h3>

              <p className="mt-5 max-w-[510px] text-sm leading-7 text-[#68766a]">
                Explore images, QR codes, documents and videos through
                dedicated analysis tools designed to help identify
                potentially suspicious digital content.
              </p>

              <div className="mt-8">
                <Link
                  href="/photo"
                  className="inline-flex items-center gap-3 bg-[#294434] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#365842]"
                >
                  <ScanSearch size={17} />
                  Explore analysis tools
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            {/* Decorative visual */}
            <div className="relative hidden items-center justify-center overflow-hidden bg-[#d9e1d4] lg:flex">
              <div className="absolute h-[290px] w-[290px] rounded-full border border-[#aab9a5]" />
              <div className="absolute h-[220px] w-[220px] rounded-full border border-[#aab9a5]" />
              <div className="absolute h-[145px] w-[145px] rounded-full border border-[#aab9a5]" />

              <div className="relative flex h-24 w-24 items-center justify-center bg-[#294434] text-[#e6eee2]">
                <ShieldCheck size={43} strokeWidth={1.3} />
              </div>

              <span className="absolute left-[16%] top-[22%] h-3 w-3 rounded-full bg-[#829c7e]" />
              <span className="absolute bottom-[22%] right-[19%] h-2 w-2 rounded-full bg-[#829c7e]" />
              <span className="absolute right-[17%] top-[25%] h-2 w-2 rounded-full bg-[#829c7e]" />

              <p className="absolute bottom-7 text-[9px] font-medium tracking-[2.5px] text-[#708571]">
                ANALYSE · VERIFY · UNDERSTAND
              </p>
            </div>
          </div>
        </section>

        {/* Analysis tools */}
        <section className="mt-12">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold tracking-[2px] text-[#819080]">
                THE TOOLKIT
              </p>
              <h3 className="mt-2 text-[25px] font-semibold tracking-[-0.7px] text-[#26332a]">
                Analysis modules
              </h3>
            </div>

            <p className="text-xs text-[#81877e]">
              Select a tool to begin
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-0 border-y border-[#dedfd5] sm:grid-cols-2 xl:grid-cols-4">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className={`group flex min-h-[245px] flex-col border-[#dedfd5] p-6 transition-colors hover:bg-[#eceee6] ${
                    index % 2 === 0 ? "sm:border-r" : ""
                  } xl:border-r xl:last:border-r-0`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] tabular-nums text-[#899287]">
                      {module.number}
                    </span>
                    <ArrowUpRight
                      size={17}
                      className="text-[#8b9688] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </div>

                  <div className="mt-7 flex h-10 w-10 items-center justify-center bg-[#e5eae0] text-[#42614a]">
                    <Icon size={20} strokeWidth={1.7} />
                  </div>

                  <h4 className="mt-5 text-[16px] font-semibold text-[#29372d]">
                    {module.name}
                  </h4>

                  <p className="mt-2 text-xs leading-6 text-[#788076]">
                    {module.description}
                  </p>

                  <span className="mt-auto pt-5 text-[9px] font-semibold tracking-[1.6px] text-[#819080]">
                    {module.detail}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Assistant section */}
        <section className="mt-12 grid grid-cols-1 gap-8 border-t border-[#dedfd5] pt-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[2px] text-[#819080]">
              <Sparkles size={14} />
              YOUR COMPANION
            </div>

            <div className="mt-4 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#e5eae0] text-[#42614a]">
                <Bot size={22} />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#29372d]">
                  AI Security Assistant
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#788076]">
                  Explore the assistant interface for help understanding
                  security concepts and interpreting analysis information.
                </p>
                <Link
                  href="/assistant"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#42614a] hover:text-[#294434]"
                >
                  Open assistant
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-l border-[#dedfd5] pl-0 lg:pl-8">
            <p className="text-[10px] font-semibold tracking-[2px] text-[#819080]">
              ABOUT THIS WORKSPACE
            </p>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#788076]">
              DeepShield brings multiple digital content analysis tools
              together in one place. Results are generated by machine
              learning and inspection systems, so treat them as indicators
              rather than definitive proof of authenticity or fraud.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 flex flex-col justify-between gap-2 border-t border-[#dedfd5] pt-5 text-[10px] tracking-wide text-[#92978e] sm:flex-row">
          <span>DEEPSHIELD AI · MULTIMODAL SECURITY</span>
          <span>BUILT BY CODE SANTOS · 2026</span>
        </footer>
      </div>
    </div>
  );
}
