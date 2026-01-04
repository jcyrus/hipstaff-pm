"use client";

import { useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetProjectsQuery } from "@/state/api";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Divider,
  useTheme,
} from "@mui/material";

interface Team {
  teamId: number;
  teamName: string;
  role: string;
}

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

  const { data: projects } = useGetProjectsQuery();
  const dispatch = useDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const theme = useTheme();

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/teams");
        if (res.ok) {
          const data = await res.json();
          const mappedTeams = data.map((t: { id: number; team_name: string }) => ({
            teamId: t.id,
            teamName: t.team_name,
            role: "member",
          }));
          setTeams(mappedTeams);
          if (mappedTeams.length > 0 && !currentTeam) {
            setCurrentTeam(mappedTeams[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    }
    fetchTeams();
  }, [currentTeam]);

  const handleTeamSwitch = (teamId: number) => {
    const team = teams.find((t) => t.teamId === teamId);
    if (team) setCurrentTeam(team);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={!isSidebarCollapsed}
      sx={{
        width: isSidebarCollapsed ? 0 : 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          borderRight: "none",
          backgroundColor: theme.palette.background.paper,
          overflowX: "hidden", // Prevent horizontal scroll
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            HipStaff
          </Typography>
          {!isSidebarCollapsed && (
            <IconButton onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}>
              <X className="h-6 w-6" />
            </IconButton>
          )}
        </Box>

        {/* Team Switcher */}
        <Box sx={{ px: 2, py: 2 }}>
          <FormControl fullWidth size="small">
            <Select
              value={currentTeam?.teamId || ""}
              onChange={(e) => handleTeamSwitch(Number(e.target.value))}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Select Team</Typography>
                    </Box>
                  );
                }
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Image src="/logo.svg" alt="Logo" width={24} height={24} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {currentTeam?.teamName}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LockIcon size={12} />
                        <Typography variant="caption" color="text.secondary">Private</Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              }}
              sx={{
                "& .MuiSelect-select": { py: 1 },
                backgroundColor: theme.palette.action.hover,
              }}
            >
              {teams.map((team) => (
                <MenuItem key={team.teamId} value={team.teamId}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "action.selected",
                        borderRadius: 0.5,
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                      }}
                    >
                      {team.teamName.charAt(0)}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {team.teamName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {team.role}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Navigation */}
        <List component="nav" sx={{ flex: 1, overflowY: "auto" }}>
          <SidebarLink icon={Home} label="Home" href="/" />
          <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
          <SidebarLink icon={Search} label="Search" href="/search" />
          <SidebarLink icon={Settings} label="Settings" href="/settings" />
          <SidebarLink icon={User} label="Users" href="/users" />
          <SidebarLink icon={Users} label="Teams" href="/teams" />
          <SidebarLink icon={Shield} label="Admin" href="/admin" />

          {/* Projects Section */}
          <ListItemButton onClick={() => setShowProjects(!showProjects)}>
            <ListItemText primary="Projects" primaryTypographyProps={{ color: "text.secondary" }} />
            {showProjects ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </ListItemButton>
          <Collapse in={showProjects} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {projects?.map((project) => (
                <SidebarLink
                  key={project.id}
                  icon={Briefcase}
                  label={project.name}
                  href={`/projects/${project.id}`}
                />
              ))}
            </List>
          </Collapse>

          {/* Priority Section */}
          <ListItemButton onClick={() => setShowPriority(!showPriority)}>
            <ListItemText primary="Priority" primaryTypographyProps={{ color: "text.secondary" }} />
            {showPriority ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </ListItemButton>
          <Collapse in={showPriority} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <SidebarLink icon={AlertCircle} label="Urgent" href="/priority/urgent" />
              <SidebarLink icon={ShieldAlert} label="High" href="/priority/high" />
              <SidebarLink icon={AlertTriangle} label="Medium" href="/priority/medium" />
              <SidebarLink icon={AlertOctagon} label="Low" href="/priority/low" />
              <SidebarLink icon={Layers3} label="Backlog" href="/priority/backlog" />
            </List>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");
  const theme = useTheme();

  return (
    <ListItemButton
      component={Link}
      href={href}
      selected={isActive}
      sx={{
        pl: 4,
        "&.Mui-selected": {
          backgroundColor: theme.palette.action.selected,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: isActive ? "primary.main" : "text.secondary" }}>
        <Icon size={20} />
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          fontWeight: isActive ? "bold" : "medium",
          color: isActive ? "text.primary" : "text.secondary",
        }}
      />
    </ListItemButton>
  );
};

export default Sidebar;
