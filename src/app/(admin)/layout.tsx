"use client";

import React from "react";
import StoreProvider, { useAppSelector } from "@/app/redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "@/app/theme";
import NextTopLoader from "nextjs-toploader";

/**
 * AdminGroupLayout - Provider wrapper for admin route group.
 * The admin-specific UI (sidebar, header) is in (admin)/admin/layout.tsx.
 */
function AdminGroupLayoutInner({ children }: { children: React.ReactNode }) {
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

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <AdminGroupLayoutInner>{children}</AdminGroupLayoutInner>
    </StoreProvider>
  );
}
