import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HipStaff",
  description: "Project Management Application",
};

/**
 * RootLayout - Minimal root layout.
 * Route group layouts handle their own providers and UI (sidebar/navbar).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
