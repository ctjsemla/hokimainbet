import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HokiMainbet",
  description: "HokiMainbet — premium gaming experience",
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
