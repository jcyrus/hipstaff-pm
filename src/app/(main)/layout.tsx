"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StoreProvider, { useAppSelector } from "@/app/redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "@/app/theme";
import NextTopLoader from "nextjs-toploader";

/**
 * MainLayout - Full dashboard layout with sidebar and navbar.
 * Used for all authenticated main application pages.
 */
function MainLayoutInner({ children }: { children: React.ReactNode }) {
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
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
        <Sidebar />
        <main className="flex w-full flex-col bg-gray-50 dark:bg-dark-bg transition-all duration-300 ease-in-out">
          <Navbar />
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </StoreProvider>
  );
}
