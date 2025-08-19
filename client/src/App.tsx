import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import PrivateRoute from "./components/PrivateRoute";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

// MUI Theme (jen vizuál)
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

// ✅ Importujeme nově vytvořené stránky
import Finance from "./pages/Finance";
import Diet from "./pages/Diet";
import Training from "./pages/Training";
import Habits from "./pages/Habits";
import UserSetting from "./components/UserSettingForm";
import MainDashboard from "./pages/MainDashboardPage";

// Router wrapper je v index.tsx. Tady necháváme jen Routes.

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976D2" }, // hlavní modrá
    secondary: { main: "#0D47A1" }, // tmavší modrá
    background: { default: "#f4f6f8", paper: "#ffffff" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: `'Inter', 'DM Sans', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h1: { fontWeight: 800, letterSpacing: -0.5 },
    h2: { fontWeight: 800, letterSpacing: -0.2 },
    h3: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 18, paddingBlock: 10 },
      },
    },
    MuiContainer: { defaultProps: { maxWidth: "lg" } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* 🔒 Chráněné routy */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<MainDashboard />} />
              <Route path="diet" element={<Diet />} />
              <Route path="training" element={<Training />} />
              <Route path="habits" element={<Habits />} />
              {/* TODO: <Route path="finance" element={<Finance />} /> */}
            </Route>
            <Route path="/settings" element={<Settings />} />
            <Route path="/userSetting" element={<UserSetting />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
