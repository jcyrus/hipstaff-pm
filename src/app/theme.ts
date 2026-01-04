"use client";

import { createTheme } from "@mui/material/styles";

// Define your color palette based on tailwind.config.ts
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3b82f6", // blue-500
    },
    secondary: {
      main: "#6b7280", // gray-500
    },
    background: {
      default: "#f3f4f6", // gray-100
      paper: "#ffffff", // white
    },
    text: {
      primary: "#1f2937", // gray-800
      secondary: "#6b7280", // gray-500
    },
  },
  typography: {
    fontFamily: "inherit", // Inherit from Tailwind/Global CSS
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0275ff", // blue-primary
    },
    secondary: {
      main: "#3b3d40", // dark-tertiary
    },
    background: {
      default: "#101214", // dark-bg
      paper: "#1d1f21", // dark-secondary
    },
    text: {
      primary: "#ffffff", // white
      secondary: "#9ca3af", // gray-400 (approx)
    },
  },
  typography: {
    fontFamily: "inherit",
  },
});
