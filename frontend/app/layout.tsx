
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "DeepShield | Security Intelligence",
  description:
    "A multimodal security platform for analysing images, QR codes, documents and videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f5ef] text-[#202820] antialiased">
        <div className="flex min-h-screen">
          <Sidebar />

          <main className="min-w-0 flex-1 bg-[#f5f5ef]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
