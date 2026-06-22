import React, { useEffect, useState } from "react";
import API from "../api";

function SpecialistDashboard() {
  const [repairs, setRepairs] = useState([]);

  const statuses = [
    "На діагностиці",
    "У ремонті",
    "Очікує деталей",
    "Завершена",
  ];

  const loadRepairs = async () => {
    const res = await API.get("/repairs/assigned");
    setRepairs(res.data);
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const updateRepair = async (id, data) => {
    await API.put(`/repairs/${id}/specialist`, data);
    loadRepairs();
  };

  return (
    <main className="container">
      <h1>Кабінет спеціаліста</h1>

      <section>
        <h2>Призначені заявки</h2>

        <div className="cards">
          {repairs.map((repair) => (
            <RepairCard
              key={repair._id}
              repair={repair}
              statuses={statuses}
              onSave={updateRepair}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function RepairCard({ repair, statuses, onSave }) {
  const [form, setForm] = useState({
    status: repair.status,
    specialistComment: repair.specialistComment || "",
    usedParts: repair.usedParts || "",
    price: repair.price || 0,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="card">
      <h3>
        {repair.deviceType} — {repair.model}
      </h3>

      <p>
        <b>Клієнт:</b> {repair.client?.name}
      </p>
      <p>
        <b>Email:</b> {repair.client?.email}
      </p>
      <p>
        <b>Телефон:</b> {repair.contactPhone}
      </p>
      <p>
        <b>Опис проблеми:</b> {repair.problemDescription}
      </p>

      <label>Статус:</label>
      <select name="status" value={form.status} onChange={handleChange}>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <label>Коментар спеціаліста:</label>
      <textarea
        name="specialistComment"
        value={form.specialistComment}
        onChange={handleChange}
      />

      <label>Використані деталі:</label>
      <input name="usedParts" value={form.usedParts} onChange={handleChange} />

      <label>Вартість ремонту:</label>
      <input
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
      />

      <button onClick={() => onSave(repair._id, form)}>Зберегти зміни</button>
    </div>
  );
}

export default SpecialistDashboard;
