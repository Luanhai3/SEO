import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ChatBot from "./components/ChatBot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
  ? new URL(process.env.NEXT_PUBLIC_BASE_URL) 
  : new URL('https://seo-audit-tool.vercel.app');

export const viewport: Viewport = {
  themeColor: '#050505',
};

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: "SEO Audit Tool - Web3 Edition",
    template: "%s | SEO Audit Tool",
  },
  description: "Phân tích SEO Website siêu tốc độ với giao diện Web3.",
  openGraph: {
    title: "SEO Audit Tool - Web3 Edition",
    description: "Phân tích SEO Website siêu tốc độ với giao diện Web3.",
    url: baseUrl.toString(),
    siteName: "SEO Audit Tool",
    images: [
      {
        url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&h=630&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "SEO Audit Tool Web3 Interface",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Audit Tool - Web3 Edition",
    description: "Phân tích SEO Website siêu tốc độ với giao diện Web3.",
    images: ["https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&h=630&auto=format&fit=crop"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#050505] text-white`}
      >
        <Providers>
          {children}
          <ChatBot />
        </Providers>
      </body>
    </html>
  );
}
