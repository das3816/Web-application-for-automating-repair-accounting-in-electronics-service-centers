import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/register", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") navigate("/admin");
      else if (res.data.user.role === "specialist") navigate("/specialist");
      else navigate("/user");
    } catch (err) {
      setError(err.response?.data?.message || "Помилка реєстрації");
    }
  };

  return (
    <div className="auth-page">
      <form className="card" onSubmit={register}>
        <h2>Реєстрація</h2>

        {error && <p className="error">{error}</p>}

        <input
          name="name"
          placeholder="Ім'я"
          value={form.name}
          onChange={handleChange}
        />

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

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">Користувач</option>
          <option value="specialist">Спеціаліст</option>
          <option value="admin">Адміністратор</option>
        </select>

        <button>Зареєструватися</button>

        <p>
          Уже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
