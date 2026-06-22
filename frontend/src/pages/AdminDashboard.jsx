import React, { useEffect, useState } from "react";
import API from "../api";

function AdminDashboard() {
  const [repairs, setRepairs] = useState([]);
  const [users, setUsers] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("repairs");
  const [repairFilter, setRepairFilter] = useState("all");

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [editingUserId, setEditingUserId] = useState(null);

  const statuses = [
    "Нова",
    "Прийнята в обробку",
    "На діагностиці",
    "У ремонті",
    "Очікує деталей",
    "Завершена",
    "Видана клієнту",
    "Скасована",
  ];

  const loadData = async () => {
    const repairsRes = await API.get("/admin/repairs");
    const usersRes = await API.get("/admin/users");
    const specialistsRes = await API.get("/admin/specialists");
    const statsRes = await API.get("/admin/stats");

    setRepairs(repairsRes.data);
    setUsers(usersRes.data);
    setSpecialists(specialistsRes.data);
    setStats(statsRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveUser = async (e) => {
    e.preventDefault();

    if (editingUserId) {
      await API.put(`/admin/users/${editingUserId}`, userForm);
    } else {
      await API.post("/admin/users", userForm);
    }

    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "user",
    });

    setEditingUserId(null);
    loadData();
  };

  const editUser = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
  };

  const deleteUser = async (id) => {
    if (window.confirm("Видалити користувача?")) {
      await API.delete(`/admin/users/${id}`);
      loadData();
    }
  };

  const updateRepair = async (id, field, value) => {
    await API.put(`/admin/repairs/${id}`, {
      [field]: value,
    });

    loadData();
  };

  const deleteRepair = async (id) => {
    if (window.confirm("Видалити заявку?")) {
      await API.delete(`/admin/repairs/${id}`);
      loadData();
    }
  };

  const filteredRepairs = repairs.filter((repair) => {
    if (repairFilter === "all") return true;

    if (repairFilter === "active") {
      return !["Завершена", "Видана клієнту", "Скасована"].includes(
        repair.status,
      );
    }

    if (repairFilter === "completed") {
      return (
        repair.status === "Завершена" || repair.status === "Видана клієнту"
      );
    }

    if (repairFilter === "canceled") {
      return repair.status === "Скасована";
    }

    return true;
  });

  return (
    <main className="container">
      <h1>Адміністративна панель</h1>

      {stats && (
        <section className="stats">
          <button
            className={`stat ${repairFilter === "all" ? "active-stat" : ""}`}
            onClick={() => {
              setTab("repairs");
              setRepairFilter("all");
            }}>
            Усього заявок: {stats.total}
          </button>

          <button
            className={`stat ${repairFilter === "active" ? "active-stat" : ""}`}
            onClick={() => {
              setTab("repairs");
              setRepairFilter("active");
            }}>
            Активні: {stats.active}
          </button>

          <button
            className={`stat ${repairFilter === "completed" ? "active-stat" : ""}`}
            onClick={() => {
              setTab("repairs");
              setRepairFilter("completed");
            }}>
            Завершені: {stats.completed}
          </button>

          <button
            className={`stat ${repairFilter === "canceled" ? "active-stat" : ""}`}
            onClick={() => {
              setTab("repairs");
              setRepairFilter("canceled");
            }}>
            Скасовані: {stats.canceled}
          </button>

          <button className="stat" onClick={() => setTab("users")}>
            Користувачі: {stats.users}
          </button>

          <button className="stat" onClick={() => setTab("specialists")}>
            Спеціалісти: {stats.specialists}
          </button>
        </section>
      )}

      <div className="admin-tabs">
        <button onClick={() => setTab("repairs")}>Заявки</button>
        <button onClick={() => setTab("users")}>Користувачі</button>
        <button onClick={() => setTab("specialists")}>Спеціалісти</button>
      </div>

      {tab === "repairs" && (
        <section>
          <h2>Керування заявками</h2>

          <div className="cards">
            {filteredRepairs.map((repair) => (
              <div className="card" key={repair._id}>
                <input
                  value={repair.deviceType}
                  onChange={(e) =>
                    updateRepair(repair._id, "deviceType", e.target.value)
                  }
                />

                <input
                  value={repair.model}
                  onChange={(e) =>
                    updateRepair(repair._id, "model", e.target.value)
                  }
                />

                <textarea
                  value={repair.problemDescription}
                  onChange={(e) =>
                    updateRepair(
                      repair._id,
                      "problemDescription",
                      e.target.value,
                    )
                  }
                />

                <input
                  value={repair.contactPhone}
                  onChange={(e) =>
                    updateRepair(repair._id, "contactPhone", e.target.value)
                  }
                />

                <h3>
                  #{repair._id.slice(-5)} — {repair.deviceType}
                </h3>
                <p>
                  <b>Клієнт:</b> {repair.client?.name || "Невідомо"}
                </p>

                <label>Статус:</label>
                <select
                  value={repair.status}
                  onChange={(e) =>
                    updateRepair(repair._id, "status", e.target.value)
                  }>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <label>Спеціаліст:</label>
                <select
                  value={repair.specialist?._id || ""}
                  onChange={(e) =>
                    updateRepair(repair._id, "specialist", e.target.value)
                  }>
                  <option value="">Не призначено</option>
                  {specialists.map((spec) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.name}
                    </option>
                  ))}
                </select>

                <label>Вартість:</label>
                <input
                  type="number"
                  defaultValue={repair.price}
                  onBlur={(e) =>
                    updateRepair(repair._id, "price", Number(e.target.value))
                  }
                />

                <button
                  className="danger"
                  onClick={() => deleteRepair(repair._id)}>
                  Видалити заявку
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {(tab === "users" || tab === "specialists") && (
        <section>
          <h2>
            {tab === "users"
              ? "Керування користувачами"
              : "Керування спеціалістами"}
          </h2>

          <form className="card grid-form" onSubmit={saveUser}>
            <input
              placeholder="Ім'я"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder={
                editingUserId ? "Новий пароль, якщо потрібно змінити" : "Пароль"
              }
              value={userForm.password}
              onChange={(e) =>
                setUserForm({ ...userForm, password: e.target.value })
              }
            />

            <select
              value={userForm.role}
              onChange={(e) =>
                setUserForm({ ...userForm, role: e.target.value })
              }>
              <option value="user">Користувач</option>
              <option value="specialist">Спеціаліст</option>
              <option value="admin">Адміністратор</option>
            </select>

            <button>
              {editingUserId ? "Зберегти зміни" : "Додати користувача"}
            </button>
          </form>

          <div className="cards">
            {users
              .filter((user) =>
                tab === "specialists"
                  ? user.role === "specialist"
                  : user.role !== "specialist",
              )
              .map((user) => (
                <div className="card" key={user._id}>
                  <h3>{user.name}</h3>
                  <p>
                    <b>Email:</b> {user.email}
                  </p>
                  <p>
                    <b>Роль:</b>{" "}
                    <span className="status-badge">{user.role}</span>
                  </p>

                  <button onClick={() => editUser(user)}>Редагувати</button>

                  <button
                    className="danger"
                    onClick={() => deleteUser(user._id)}>
                    Видалити
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default AdminDashboard;
