const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const RepairRequest = require("../models/RepairRequest");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: "Помилка отримання користувачів" });
  }
});

router.post("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Заповніть усі поля" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Користувач із таким email вже існує" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const safeUser = await User.findById(user._id).select("-password");
    res.status(201).json(safeUser);
  } catch {
    res.status(500).json({ message: "Помилка створення користувача" });
  }
});

router.put("/users/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    const updateData = { name, email, role };

    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    res.json(user);
  } catch {
    res.status(500).json({ message: "Помилка редагування користувача" });
  }
});

router.delete("/users/:id", protect, authorize("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Не можна видалити власний акаунт" });
    }

    await RepairRequest.updateMany(
      { specialist: req.params.id },
      { $set: { specialist: null } },
    );

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Користувача видалено" });
  } catch {
    res.status(500).json({ message: "Помилка видалення користувача" });
  }
});

router.get("/specialists", protect, authorize("admin"), async (req, res) => {
  try {
    const specialists = await User.find({ role: "specialist" }).select(
      "-password",
    );
    res.json(specialists);
  } catch {
    res.status(500).json({ message: "Помилка отримання спеціалістів" });
  }
});

router.get("/repairs", protect, authorize("admin"), async (req, res) => {
  try {
    const repairs = await RepairRequest.find()
      .populate("client", "name email")
      .populate("specialist", "name email")
      .sort({ createdAt: -1 });

    res.json(repairs);
  } catch {
    res.status(500).json({ message: "Помилка отримання заявок" });
  }
});

router.put("/repairs/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const {
      deviceType,
      model,
      problemDescription,
      contactPhone,
      status,
      specialist,
      price,
    } = req.body;

    const repair = await RepairRequest.findById(req.params.id);

    if (!repair) {
      return res.status(404).json({ message: "Заявку не знайдено" });
    }

    if (deviceType !== undefined) repair.deviceType = deviceType;
    if (model !== undefined) repair.model = model;
    if (problemDescription !== undefined)
      repair.problemDescription = problemDescription;
    if (contactPhone !== undefined) repair.contactPhone = contactPhone;
    if (status !== undefined) repair.status = status;
    if (specialist !== undefined) repair.specialist = specialist || null;
    if (price !== undefined) repair.price = price;

    if (status === "Завершена") {
      repair.completedAt = new Date();
    }

    repair.history.push({
      status: repair.status,
      changedBy: req.user._id,
      comment: "Заявку оновлено адміністратором",
    });

    await repair.save();

    const updatedRepair = await RepairRequest.findById(repair._id)
      .populate("client", "name email")
      .populate("specialist", "name email");

    res.json(updatedRepair);
  } catch {
    res.status(500).json({ message: "Помилка редагування заявки" });
  }
});

router.delete("/repairs/:id", protect, authorize("admin"), async (req, res) => {
  try {
    await RepairRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Заявку видалено" });
  } catch {
    res.status(500).json({ message: "Помилка видалення заявки" });
  }
});

router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const total = await RepairRequest.countDocuments();

    const active = await RepairRequest.countDocuments({
      status: { $nin: ["Завершена", "Видана клієнту", "Скасована"] },
    });

    const completed = await RepairRequest.countDocuments({
      status: "Завершена",
    });
    const canceled = await RepairRequest.countDocuments({
      status: "Скасована",
    });
    const users = await User.countDocuments({ role: "user" });
    const specialists = await User.countDocuments({ role: "specialist" });

    res.json({
      total,
      active,
      completed,
      canceled,
      users,
      specialists,
    });
  } catch {
    res.status(500).json({ message: "Помилка отримання статистики" });
  }
});

module.exports = router;
