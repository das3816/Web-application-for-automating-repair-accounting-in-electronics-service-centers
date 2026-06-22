import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") navigate("/admin");
      else if (res.data.user.role === "specialist") navigate("/specialist");
      else navigate("/user");
    } catch (err) {
      setError(err.response?.data?.message || "Помилка входу");
    }
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={login}>
        <h2>Вхід</h2>

        {error && <p className="error">{error}</p>}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
        />

        <button>Увійти</button>

        <p>
          Немає акаунта? <Link to="/register">Зареєструватися</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
