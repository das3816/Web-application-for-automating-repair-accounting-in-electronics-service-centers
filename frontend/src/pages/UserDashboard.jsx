import React, { useEffect, useState } from "react";
import API from "../api";

function UserDashboard() {
  const [repairs, setRepairs] = useState([]);
  const [form, setForm] = useState({
    deviceType: "",
    model: "",
    problemDescription: "",
    contactPhone: "",
  });

  const loadRepairs = async () => {
    const res = await API.get("/repairs/my");
    setRepairs(res.data);
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createRepair = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/repairs", form);

      console.log("Заявку створено:", res.data);

      setForm({
        deviceType: "",
        model: "",
        problemDescription: "",
        contactPhone: "",
      });

      await loadRepairs();
    } catch (err) {
      console.log("Помилка створення заявки:", err);
      console.log("Відповідь сервера:", err.response?.data);

      alert(err.response?.data?.message || "Помилка створення заявки");
    }
  };

  return (
    <main className="container">
      <h1>Кабінет користувача</h1>

      <section className="card">
        <h2>Створити заявку на ремонт</h2>

        <form onSubmit={createRepair} className="grid-form">
          <input
            name="deviceType"
            placeholder="Тип пристрою"
            value={form.deviceType}
            onChange={handleChange}
          />
          <input
            name="model"
            placeholder="Модель"
            value={form.model}
            onChange={handleChange}
          />
          <input
            name="contactPhone"
            placeholder="Контактний телефон"
            value={form.contactPhone}
            onChange={handleChange}
          />
          <textarea
            name="problemDescription"
            placeholder="Опис несправності"
            value={form.problemDescription}
            onChange={handleChange}
          />
          <button type="submit">Надіслати заявку</button>{" "}
        </form>
      </section>

      <section>
        <h2>Мої заявки</h2>

        <div className="cards">
          {repairs.map((repair) => (
            <div className="card" key={repair._id}>
              <h3>
                {repair.deviceType} — {repair.model}
              </h3>
              <p>{repair.problemDescription}</p>
              <p>
                <b>Статус:</b>{" "}
                <span className="status-badge">{repair.status}</span>
              </p>
              <p>
                <b>Спеціаліст:</b> {repair.specialist?.name || "Не призначено"}
              </p>
              <p>
                <b>Вартість:</b> {repair.price} грн
              </p>
              <p>
                <b>Коментар:</b> {repair.specialistComment || "Немає"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default UserDashboard;
