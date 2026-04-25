import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "regexrun — a quiet little regex playground",
  description:
    "Test, debug, and share regular expressions in your browser. Live highlighted matches, capture groups, replace mode, and a small library of patterns developers actually use.",
  openGraph: {
    title: "regexrun",
    description:
      "A quiet little regex playground. Live matches, capture groups, replace mode, presets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink antialiased min-h-screen">{children}</body>
    </html>
  );
}
