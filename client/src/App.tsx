import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import PrivateRoute from "./components/PrivateRoute";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar"; // ✅ Přidáváme Navbar
import { AuthProvider } from "./context/AuthContext"; // ✅ Přidáno

// ✅ Importujeme nově vytvořené stránky
import Finance from "./pages/Finance";
import Diet from "./pages/Diet";
import Training from "./pages/Training";
import Habits from "./pages/Habits";
import UserSetting from "./components/UserSettingForm";
import MainDashboard from "./pages/MainDashboardPage";

//!!! TODO - add logic to Finance route
//<Route path="finance" element={<Finance />} />

function App() {
  return (
    <AuthProvider>
      <Router basename="/projekty/lifeManager">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* 🔥 Chráněné routy */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<MainDashboard />} />
              <Route path="diet" element={<Diet />} />
              <Route path="training" element={<Training />} />
              <Route path="habits" element={<Habits />} />
            </Route>
            <Route path="/settings" element={<Settings />} />
            <Route path="/userSetting" element={<UserSetting />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
