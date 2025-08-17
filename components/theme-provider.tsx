"use client"

import GlobalContextProvider from "@/context/GlobalContextProvider"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import * as React from "react"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>
    <GlobalContextProvider>

    {children}
    </GlobalContextProvider>
    </NextThemesProvider>
}