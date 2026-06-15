import {
  AppBar, Avatar, Box, Chip, CssBaseline, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, Button, useMediaQuery
} from "@mui/material";
import {
  Category, Dashboard, Description, Group, Logout, Menu, Person, Search,
  UploadFile, LightMode, DarkMode
} from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const drawerWidth = 248;

export default function AppLayout({ darkMode, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme => theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const nav = [
    { label: "Dashboard", path: "/", icon: <Dashboard /> },
    { label: "Categories", path: "/categories", icon: <Category /> },
    { label: "Documents", path: "/documents", icon: <Description /> },
    { label: "Upload Document", path: "/documents/upload", icon: <UploadFile /> },
    { label: "Search", path: "/search", icon: <Search /> },
    ...(user.role === "ADMIN" ? [{ label: "Users", path: "/users", icon: <Group /> }] : []),
    { label: "Profile", path: "/profile", icon: <Person /> }
  ];

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const drawer = (
    <Box className="sidebar-shell">
      <Toolbar className="brand-block">
        <Box>
          <Typography variant="h6" fontWeight={900}>AetherVault</Typography>
          <Typography variant="caption" color="text.secondary">Secure document intelligence</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {nav.map(item => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{ borderRadius: 1, mb: 0.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box className="sidebar-user">
        <Avatar sx={{ bgcolor: "primary.main" }}>{user.username?.charAt(0)?.toUpperCase() || "A"}</Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={800} noWrap>{user.username || "Account"}</Typography>
          <Chip size="small" label={user.role || "USER"} color={user.role === "ADMIN" ? "secondary" : "default"} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          borderBottom: "1px solid rgba(255,255,255,0.12)"
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <Menu />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
            Secure Document Repository
          </Typography>
          <IconButton color="inherit" onClick={onToggleTheme}>
            {darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          <Button color="inherit" startIcon={<Logout />} onClick={logout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" className="app-main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, minHeight: "100vh" }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1180, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
