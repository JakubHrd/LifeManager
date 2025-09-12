import { Routes, Route, Navigate } from "react-router-dom";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";
import AppShell from "../layout/AppShell";
import LandingPage from "../pages/LandingPage";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import SettingsUnifiedPage from "@/pages/SettingsUnifiedPage";
// (volitelně) import AuthGuard pokud chceš chránit větve:
// import AuthGuard from "@/features/auth/components/AuthGuard";
import MainDashboard from "../pages/MainDashboardPage";
import TrainingPage from "../modules/activity/pages/TrainingPage";
import HabitsPage from "../modules/activity/pages/HabitsPage";
import MealsPage from "../modules/activity/pages/MealsPage";
import FinancePage from "@/modules/finance/pages/FinancePage";
import VerifyEmailPage from "@/features/auth/pages/VerifyEmailPage"; 
import Settings from "../pages/Settings";
import UserSetting from "../components/UserSettingForm";

import { features } from "../app/features"; // pokud už ho importuješ, neřeš
// import Finance from "../pages/Finance";

export default function AppRoutes() {
  return (
    <Routes>
      {/* <-- AppShell obaluje VŠECHNO: navbar je všude */}
      <Route element={<AppShell />}>
        {/* Public / guest */}
        <Route element={<GuestRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/verify" element={<VerifyEmailPage />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/dashboard/diet" element={<MealsPage />} />
          <Route path="/dashboard/training" element={<TrainingPage />} />
          <Route path="/dashboard/habits" element={<HabitsPage  />} />
          <Route path="/dashboard/finance" element={<FinancePage   />} />
          {/* 
          <Route path="/dashboard/diet" element={features?.activityUnified ? <MealsPage /> : <Diet />} />
          <Route path="/dashboard/training" element={<Training />} />
          <Route path="/dashboard/habits" element={<Habits />} />  
          */}
          
          {/* <Route path="/dashboard/finance" element={<Finance />} /> */}
          <Route path="/settings" element={<SettingsUnifiedPage />} />
          <Route path="/userSetting" element={<SettingsUnifiedPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
