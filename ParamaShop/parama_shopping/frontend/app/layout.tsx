import type { Metadata } from "next";
import { Playfair_Display, Sora } from "next/font/google";
import "@/styles/globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Parama Shopping",
  description: "Your modern shopping destination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-[#f7f5f0] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
