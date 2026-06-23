import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "../lib/registry";
import ThemeProviders from "@/providers/theme-provider";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Taskio",
    template: "%s | Taskio"
  },
  description: "Taskio - A simple task management app built with Next.js 13 and styled-components",
  icons: {
    icon: "/images/favicon.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <head>
        <title>Taskio</title>
        <meta
          name="description"
          content="Taskio - A simple task management app built with Next.js 13 and styled-components"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/favicon.svg" />
      </head> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StyledComponentsRegistry>
          <ThemeProviders>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
