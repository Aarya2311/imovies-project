const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
    },
    showtime: { type: String, required: true, trim: true },
    showDate: {
      type: String,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Show date must use YYYY-MM-DD format."],
    },
    showtimeAt: { type: Date },
    seats: { type: Number, required: true, min: 1, max: 10, validate: Number.isInteger },
    ticketPrice: { type: Number, required: true, min: 1, validate: Number.isInteger },
    totalPrice: { type: Number, required: true, min: 1, validate: Number.isInteger },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
