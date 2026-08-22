import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/session-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Codeit — Share AI-generated code",
  description:
    "Codeit is a community for posting, running, and remixing AI-generated code. Share snippets, upvote, comment, and play with live demos.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#1a1c22",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className="font-sans antialiased">
        <SessionProvider>
          {children}
          <Toaster position="top-center" />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </SessionProvider>
      </body>
    </html>
  )
}
