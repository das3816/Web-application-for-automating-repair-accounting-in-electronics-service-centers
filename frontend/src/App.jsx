import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SpecialistDashboard from "./pages/SpecialistDashboard";
import React from "react";

function App() {
  const navigate = useNavigate();
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getHomeByRole = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "specialist") return "/specialist";
    return "/user";
  };

  return (
    <div>
      <header className="header">
        <h2>Сервісний центр електроніки</h2>

        <nav>
          {user ? (
            <>
              <span>
                {user.name} / {user.role}
              </span>
              <button onClick={logout}>Вийти</button>
            </>
          ) : (
            <>
              <Link to="/login">Вхід</Link>
              <Link to="/register">Реєстрація</Link>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to={getHomeByRole()} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/user" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/specialist" element={<SpecialistDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
