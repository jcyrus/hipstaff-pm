import React, { useState, useEffect } from "react";
import { Menu, Moon, Search, Settings, Sun, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Box,
  useTheme,
  Avatar,
  Menu as MuiMenu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { getSupabaseClient } from "@/lib/supabase/client";

const NavBar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState<string>("U");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    async function fetchUser() {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        // Generate initials from email or user metadata
        const name =
          user.user_metadata?.full_name || user.user_metadata?.name || user.email;
        if (name) {
          const parts = name.split(/[@\s]/);
          setUserInitials(
            parts
              .slice(0, 2)
              .map((p: string) => p[0]?.toUpperCase() ?? "")
              .join("")
          );
        }
      }
    }
    fetchUser();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    handleMenuClose();
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ bgcolor: "background.paper" }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Search Bar */}
        <Box display="flex" alignItems="center" gap={2}>
          {isSidebarCollapsed && (
            <IconButton
              onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
            >
              <Menu className="h-6 w-6" />
            </IconButton>
          )}
          <Box
            sx={{
              position: "relative",
              borderRadius: 1,
              backgroundColor:
                theme.palette.mode === "dark" ? "grey.800" : "grey.100",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "grey.700" : "grey.200",
              },
              width: 200,
              display: "flex",
              alignItems: "center",
              px: 1,
            }}
          >
            <Search className="h-5 w-5" />
            <InputBase placeholder="Search..." sx={{ ml: 1, flex: 1 }} />
          </Box>
        </Box>

        {/* Icons & User Menu */}
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => dispatch(setIsDarkMode(!isDarkMode))}>
            {isDarkMode ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </IconButton>

          <Link href="/settings">
            <IconButton>
              <Settings className="h-6 w-6" />
            </IconButton>
          </Link>

          <Box
            sx={{
              mx: 2,
              height: "2em",
              width: "1px",
              bgcolor: "divider",
              display: { xs: "none", md: "block" },
            }}
          />

          {/* User Avatar & Dropdown */}
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            aria-controls={menuOpen ? "user-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {userInitials}
            </Avatar>
          </IconButton>

          <MuiMenu
            id="user-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  minWidth: 200,
                  mt: 1,
                  overflow: "visible",
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {userEmail?.split("@")[0] ?? "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userEmail ?? "Loading..."}
              </Typography>
            </Box>
            <Divider />

            {/* Profile Link */}
            <MenuItem
              onClick={() => {
                handleMenuClose();
                router.push("/settings");
              }}
            >
              <ListItemIcon>
                <User className="h-4 w-4" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>

            <Divider />

            {/* Logout */}
            <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <ListItemIcon>
                <LogOut className="h-4 w-4" />
              </ListItemIcon>
              <ListItemText>
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </ListItemText>
            </MenuItem>
          </MuiMenu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;