"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Image,
  QrCode,
  FileText,
  Video,
  Bot,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Photo Analysis", href: "/photo", icon: Image },
  { name: "QR Analysis", href: "/qr", icon: QrCode },
  { name: "Document Analysis", href: "/document", icon: FileText },
  { name: "Video Analysis", href: "/video", icon: Video },
  { name: "AI Assistant", href: "/assistant", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-[#0b0f17] px-5 py-6">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
          <Shield className="h-6 w-6 text-emerald-400" />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            DeepShield
          </h1>
          <p className="text-[10px] tracking-[2px] text-gray-500">
            AI SECURITY
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-10">
        <p className="mb-4 px-3 text-xs font-semibold tracking-widest text-gray-600">
          MAIN MENU
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  active
                    ? "border border-emerald-400/10 bg-emerald-400/10 text-emerald-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System status */}
      <div className="mt-auto rounded-xl border border-emerald-400/10 bg-emerald-400/5 p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">
            System Operational
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          All security modules are running.
        </p>
      </div>

    </aside>
  );
}