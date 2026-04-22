import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionTimeoutWatcher from "./components/SessionTimeoutWatcher";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Vault from "./pages/Vault";
import { useAuth } from "./context/AuthContext";

function App() {
  const { token } = useAuth();

  return (
    <div className="app-shell">
      <div className="cyber-aurora" />
      <div className="cyber-grid" />
      <Navbar />
      <SessionTimeoutWatcher />
      <main className="content-wrap">
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vault"
            element={
              <ProtectedRoute>
                <Vault />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
