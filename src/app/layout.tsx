import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppContext from "./AppContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlueprintDoc | Online e-signature",
  description: "Document Review and Intelligent Agreement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        cz-shortcut-listen='true'
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppContext>
        <Toaster position="top-right"/>

        {children}

        </AppContext>
      </body>
    </html>
  );
}
