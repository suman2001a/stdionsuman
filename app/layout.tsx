import type { Metadata } from "next";
import { Inter, Outfit, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: "S SQUARE STUDIO | Sumanan",
  description: "Portfolio of Sumanan, Video Editor & Colorist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} ${caveat.variable} min-h-screen text-white antialiased bg-[#0a0a0a]`}>
        {children}
      </body>
    </html>
  );
}
