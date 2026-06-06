import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { AppDataProvider } from "./context/AppDataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Analytics from "./pages/Analytics";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Monthly from "./pages/Monthly";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";

function AppRoutes() {
  const { isFirebaseConfigured, loading, user } = useAuth();

  if (loading) {
    return <main className="auth-page"><section className="auth-card"><h1>載入中</h1></section></main>;
  }

  if (isFirebaseConfigured && !user) {
    return <AuthPage />;
  }

  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/monthly" element={<Monthly />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
