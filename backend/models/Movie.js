const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", maxlength: 2000 },
    genre: { type: String, required: true, trim: true, default: "Other" },
    releaseDate: { type: Date },
    releaseYear: { type: Number, min: 1888, max: 2200 },
    durationMinutes: { type: Number, required: true, min: 1, max: 600 },
    rating: { type: Number, min: 0, max: 10 },
    price: {
      type: Number,
      required: true,
      min: 1,
      max: 100000,
      validate: Number.isInteger,
    },
    posterUrl: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => {
          if (!value) {
            return true;
          }

          try {
            const url = new URL(value);
            return (
              (url.protocol === "http:" || url.protocol === "https:") &&
              Boolean(url.hostname)
            );
          } catch {
            return false;
          }
        },
        message: "Poster URL must be a valid http or https URL.",
      },
    },
    trailerUrl: {
      type: String,
      default: "",
      trim: true,
      validate: {
        validator: (value) => {
          if (!value) {
            return true;
          }

          try {
            const url = new URL(value);
            return (
              (url.protocol === "http:" || url.protocol === "https:") &&
              Boolean(url.hostname)
            );
          } catch {
            return false;
          }
        },
        message: "Trailer URL must be a valid http or https URL.",
      },
    },
    showtimes: {
      type: [{ type: String, trim: true }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
