import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Riverchurn Reserve | Stake $MOOZ Earn $wSEI",
  description: "The official staking protocol for Cool Cows Lab. Stake your $MOOZ tokens in the Riverchurn Reserve to earn real-time $wSEI rewards.",
  keywords: ["Cool Cows", "MOOZ", "Sei Network", "Staking", "Crypto Rewards", "Riverchurn Reserve"],
  openGraph: {
    title: "Riverchurn Reserve | Staking Dashboard",
    description: "Stake $MOOZ tokens and earn $wSEI rewards on the Sei Network.",
    url: "https://vaults.coolcowslab.com",
    siteName: "Riverchurn Reserve",
    images: [
      {
        url: "/images/vaults.png",
        width: 1200,
        height: 630,
        alt: "Riverchurn Reserve Staking",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Riverchurn Reserve | Staking Dashboard",
    description: "Stake $MOOZ tokens and earn $wSEI rewards on the Sei Network.",
    creator: "@CoolCowsLab",
    images: ["/images/vaults.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617]`}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}

