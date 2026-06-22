const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const repairRoutes = require("./routes/repairRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/admin", adminRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB підключено");
    app.listen(process.env.PORT, () => {
      console.log(`Сервер запущено на порту ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Помилка підключення до MongoDB:", error.message);
  });
