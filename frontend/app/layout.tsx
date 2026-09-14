import { Geist_Mono, IBM_Plex_Sans, Roboto } from "next/font/google"
import type { Metadata } from "next"
import { DemoProvider } from "@/components/simrs/provider"
import { AppShell } from "@/components/simrs/app-shell"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const robotoHeading = Roboto({ subsets: ["latin"], variable: "--font-heading" })

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
export const metadata: Metadata = {
  title: "SIMRS-e · Rumah Sakit Edukasi",
  description:
    "Simulasi administrasi rumah sakit untuk pembelajaran Fase 1. Seluruh data sintetis.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        ibmPlexSans.variable,
        robotoHeading.variable
      )}
    >
      <body>
        <ThemeProvider defaultTheme="light" enableSystem={false}>
          <DemoProvider>
            <AppShell>{children}</AppShell>
          </DemoProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
