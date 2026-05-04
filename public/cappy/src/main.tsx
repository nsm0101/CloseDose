import React from "react";
import ReactDOM from "react-dom/client";
// Swapped BrowserRouter for HashRouter
import { HashRouter, Routes, Route } from "react-router-dom"; 
import App from "./pages/app/App.jsx";
import Auth from "./pages/auth/Auth.jsx";
import Login from "./pages/login/Login.jsx";
import Onboarding from "./pages/onboarding/Onboarding.jsx";
import Scan from "./pages/scan/Scan.jsx";

const root = ReactDOM.createRoot(document.getElementById("app"));

root.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/scan" element={<Scan />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
