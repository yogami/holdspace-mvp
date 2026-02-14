import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HoldSpace — Find Your Healer, Right Now",
  description:
    "Connect with available energy workers, breathwork facilitators, and somatic healers in real-time. Instant booking, video sessions, human connection when you need it most.",
  keywords: [
    "energy healing",
    "breathwork",
    "somatic healing",
    "grief support",
    "wellness",
    "holistic healing",
    "book a healer",
  ],
  openGraph: {
    title: "HoldSpace — Find Your Healer, Right Now",
    description:
      "Warm, human support from trained facilitators. Available now, not in 3 weeks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
