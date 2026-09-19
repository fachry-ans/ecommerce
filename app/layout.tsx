import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BAITANDSTRIKE Commerce",
  description: "Fishing gear storefront, B2B pricing, orders, and operations in one system.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
