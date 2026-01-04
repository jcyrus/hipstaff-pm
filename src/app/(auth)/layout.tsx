"use client";

import React from "react";
import StoreProvider, { useAppSelector } from "@/app/redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "@/app/theme";
import NextTopLoader from "nextjs-toploader";

/**
 * AuthLayout - Minimal layout for authentication pages (login, invite).
 * No sidebar or navbar, just theme and state providers.
 */
function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <NextTopLoader
        color={isDarkMode ? "#0275ff" : "#3b82f6"}
        showSpinner={false}
      />
      {children}
    </ThemeProvider>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </StoreProvider>
  );
}
