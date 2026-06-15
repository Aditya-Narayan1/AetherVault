import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import AppLayout from "./components/AppLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Categories from "./pages/Categories.jsx";
import Documents from "./pages/Documents.jsx";
import UploadDocument from "./pages/UploadDocument.jsx";
import DocumentDetails from "./pages/DocumentDetails.jsx";
import Search from "./pages/Search.jsx";
import Users from "./pages/Users.jsx";
import Profile from "./pages/Profile.jsx";
import "./styles.css";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function Protected({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  return localStorage.getItem("token") ? <Navigate to="/" replace /> : children;
}

function AdminOnly({ children }) {
  const user = getCurrentUser();
  return user.role === "ADMIN" ? children : <Navigate to="/" replace />;
}

function Root() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#2563eb" },
      secondary: { main: "#0f766e" },
      background: {
        default: darkMode ? "#111827" : "#f5f7fb",
        paper: darkMode ? "#172033" : "#ffffff"
      }
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: "Inter, system-ui, Arial, sans-serif",
      button: { fontWeight: 800, textTransform: "none" }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 42,
            boxShadow: "none"
          },
          contained: {
            boxShadow: "0 10px 24px rgba(37, 99, 235, 0.24)"
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined"
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none"
          }
        }
      }
    }
  }), [darkMode]);

  const toggleTheme = () => {
    localStorage.setItem("theme", darkMode ? "light" : "dark");
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
          <Route path="/" element={<Protected><AppLayout darkMode={darkMode} onToggleTheme={toggleTheme} /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/upload" element={<UploadDocument />} />
            <Route path="documents/:id" element={<DocumentDetails />} />
            <Route path="search" element={<Search />} />
            <Route path="users" element={<AdminOnly><Users /></AdminOnly>} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
