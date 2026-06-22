const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const repairRequestSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deviceType: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    problemDescription: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Нова",
        "Прийнята в обробку",
        "На діагностиці",
        "У ремонті",
        "Очікує деталей",
        "Завершена",
        "Видана клієнту",
        "Скасована",
      ],
      default: "Нова",
    },
    price: {
      type: Number,
      default: 0,
    },
    specialistComment: {
      type: String,
      default: "",
    },
    usedParts: {
      type: String,
      default: "",
    },
    history: [historySchema],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RepairRequest", repairRequestSchema);
