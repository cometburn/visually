import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Visually | Interactive Body Pain Tracker & Admin Registry",
  description:
    "An interactive medical body pain mapping application for capturing patient info, pinpointing anatomical pain locations with 1-10 severity ratings and duration, and reviewing registry records in Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
