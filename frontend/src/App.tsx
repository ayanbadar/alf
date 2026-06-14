import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import AppointmentsPage from "@/pages/AppointmentsPage";
import ChatsPage from "@/pages/ChatsPage";
import KnowledgePage from "@/pages/KnowledgePage";
import LeadsPage from "@/pages/LeadsPage";
import LoginPage from "@/pages/LoginPage";
import OverviewPage from "@/pages/OverviewPage";
import RegisterPage from "@/pages/RegisterPage";
import ConnectionPage from "@/pages/ConnectionPage";
import SettingsPage from "@/pages/SettingsPage";
import { ROUTES } from "./constants";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to={ROUTES.login} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="connection" element={<ConnectionPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
