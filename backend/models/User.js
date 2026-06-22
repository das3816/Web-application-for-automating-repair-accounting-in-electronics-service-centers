const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ім'я є обов'язковим"],
    },
    email: {
      type: String,
      required: [true, "Email є обов'язковим"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Пароль є обов'язковим"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "specialist"],
      default: "user",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
