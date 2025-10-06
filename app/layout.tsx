import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
if (process.env.NODE_ENV === "development") {
  import("react-scan");
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mini Research Assistant",
  description: "A mini research assistant powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
