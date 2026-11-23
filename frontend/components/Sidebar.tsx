
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Image,
  QrCode,
  FileText,
  Video,
  Bot,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Photo Analysis", href: "/photo", icon: Image },
  { name: "QR Analysis", href: "/qr", icon: QrCode },
  { name: "Document Analysis", href: "/document", icon: FileText },
  { name: "Video Analysis", href: "/video", icon: Video },
  { name: "AI Assistant", href: "/assistant", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col bg-[#182923] px-5 py-7 text-[#f3f2e9]">
      <Link href="/" className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dce8d9] text-[#294b39]">
          <ShieldCheck size={25} strokeWidth={1.8} />
        </div>

        <div>
          <h1 className="text-[21px] font-semibold tracking-tight">
            DeepShield
          </h1>
          <p className="mt-0.5 text-[9px] font-medium tracking-[2.2px] text-[#aebcaf]">
            INTELLIGENCE PLATFORM
          </p>
        </div>
      </Link>

      <div className="mt-14">
        <p className="mb-4 px-3 text-[10px] font-semibold tracking-[2px] text-[#8e9d91]">
          WORKSPACE
        </p>

        <nav className="space-y-1">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex min-h-[46px] items-center gap-3 rounded-lg px-3 transition-colors duration-150 ${
                  active
                    ? "bg-[#30463a] text-white"
                    : "text-[#b4c0b5] hover:bg-[#263a30] hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#b3cba9]" />
                )}

                <span
                  className={`w-5 text-[10px] tabular-nums ${
                    active ? "text-[#c6d9bd]" : "text-[#718477]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.7}
                  className={
                    active
                      ? "text-[#dce8d9]"
                      : "text-[#9eafa0] group-hover:text-[#dce8d9]"
                  }
                />

                <span className="text-[13px] font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-[#405247] px-2 pt-5">
        <p className="text-[9px] font-semibold tracking-[1.8px] text-[#8e9d91]">
          MULTIMODAL SECURITY
        </p>

        <p className="mt-2 text-xs leading-5 text-[#b4c0b5]">
          One workspace for image, document and digital content analysis.
        </p>

        <p className="mt-5 text-[10px] text-[#718477]">
          DEEPSHIELD AI · V1.0
        </p>
      </div>
    </aside>
  );
}

