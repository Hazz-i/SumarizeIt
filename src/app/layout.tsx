import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Aboreto, Alegreya_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const aboreto = Aboreto({ subsets: ['latin'], weight: '400', variable: '--font-aboreto' });

const alegreyaSans = Alegreya_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-alegreya-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SumerizeIt",
  description: "Sumerize any text, topic, or PDF",
  icons: {
    icon: "/icons/icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable, aboreto.variable, alegreyaSans.variable)}
    >
      <body className="min-h-full flex flex-col font-alegreya-sans">
        {children}
      </body>
    </html>
  );
}
