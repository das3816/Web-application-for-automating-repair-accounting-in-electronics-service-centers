const express = require("express");
const RepairRequest = require("../models/RepairRequest");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("user"), async (req, res) => {
  try {
    const { deviceType, model, problemDescription, contactPhone } = req.body;

    if (!deviceType || !model || !problemDescription || !contactPhone) {
      return res.status(400).json({ message: "Заповніть усі поля заявки" });
    }

    const repair = await RepairRequest.create({
      client: req.user._id,
      deviceType,
      model,
      problemDescription,
      contactPhone,
      history: [
        {
          status: "Нова",
          changedBy: req.user._id,
          comment: "Заявку створено користувачем",
        },
      ],
    });

    res.status(201).json(repair);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Помилка створення заявки" });
  }
});

router.get("/my", protect, authorize("user"), async (req, res) => {
  try {
    const repairs = await RepairRequest.find({ client: req.user._id })
      .populate("specialist", "name email")
      .sort({ createdAt: -1 });

    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання заявок" });
  }
});

router.get("/assigned", protect, authorize("specialist"), async (req, res) => {
  try {
    const repairs = await RepairRequest.find({ specialist: req.user._id })
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання заявок спеціаліста" });
  }
});

router.put(
  "/:id/specialist",
  protect,
  authorize("specialist"),
  async (req, res) => {
    try {
      const { status, specialistComment, usedParts, price } = req.body;

      const repair = await RepairRequest.findOne({
        _id: req.params.id,
        specialist: req.user._id,
      });

      if (!repair) {
        return res.status(404).json({
          message: "Заявку не знайдено або вона вам не призначена",
        });
      }

      if (status) repair.status = status;
      if (specialistComment !== undefined)
        repair.specialistComment = specialistComment;
      if (usedParts !== undefined) repair.usedParts = usedParts;
      if (price !== undefined) repair.price = price;

      if (status === "Завершена") {
        repair.completedAt = new Date();
      }

      repair.history.push({
        status: repair.status,
        changedBy: req.user._id,
        comment: specialistComment || "Оновлено спеціалістом",
      });

      await repair.save();

      res.json(repair);
    } catch (error) {
      res.status(500).json({ message: "Помилка оновлення заявки" });
    }
  },
);

module.exports = router;
