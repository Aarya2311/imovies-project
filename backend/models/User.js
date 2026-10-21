const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["customer", "admin", "owner"],
      default: "customer",
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform(_document, result) {
    delete result.passwordHash;
    delete result.__v;
    return result;
  },
});

module.exports = mongoose.model("User", userSchema);
