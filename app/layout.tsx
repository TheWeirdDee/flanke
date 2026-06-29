import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flanke — Know your enemy's next move",
  description:
    "Real-time competitive intelligence for B2B sales teams. Monitor competitor pages, detect changes, and know what it means.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`h-full antialiased ${jakarta.className}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
