"use client"

import React, { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import StoreProvider, { useAppSelector } from './redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { lightTheme, darkTheme } from './theme'
import NextTopLoader from 'nextjs-toploader'
import { usePathname } from 'next/navigation'

const DashboardLayout = ({ children} : {  children: React.ReactNode }) => {
  const pathname = usePathname();
  const isDarkMode = useAppSelector(
    (state) => state.global.isDarkMode,
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  });

  if (pathname.startsWith("/admin")) {
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

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <NextTopLoader 
        color={isDarkMode ? "#0275ff" : "#3b82f6"}
        showSpinner={false}
      />
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
        <Sidebar />
        <main 
          className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg transition-all duration-300 ease-in-out`}
        >
          <Navbar />
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
};

const DashboardWrapper =  ({ children } : { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  )
};

export default DashboardWrapper