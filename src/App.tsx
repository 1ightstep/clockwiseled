import { Toast } from "@/components/Toast";
import { DashboardPage } from "@/pages/DashboardPage";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Toast />
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
