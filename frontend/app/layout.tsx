import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "DeepShield AI | Security Intelligence",
  description: "AI-powered multimodal security and authenticity analysis platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#080b12] text-white antialiased">
        <div className="flex min-h-screen">
          <Sidebar />

          <main className="min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}