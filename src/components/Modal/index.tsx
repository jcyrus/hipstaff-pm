"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { X } from "lucide-react";
import Header from "../Header";

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  name: string;
};

export default function Modal({ children, isOpen, onClose, name }: Readonly<Props>) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "0.5rem", // rounded-lg
          padding: "1rem", // p-4
          backgroundColor: (theme) => theme.palette.background.paper,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ p: 0, mb: 2 }}>
        <Header
          name={name}
          buttonComponent={
            <IconButton 
              onClick={onClose} 
              size="small" 
              sx={{ 
                color: "white", 
                backgroundColor: "primary.main", 
                "&:hover": { backgroundColor: "primary.dark" },
                width: 28,
                height: 28,
              }}
            >
              <X size={18} />
            </IconButton>
          }
          isSmallText
        />
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
