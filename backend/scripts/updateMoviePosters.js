require("dotenv").config();

const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const { seedMovies } = require("../data/seedMovies");

async function updateMoviePosters() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set in the backend environment.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const operations = seedMovies.map(({ title, posterUrl }) => ({
      updateOne: {
        filter: { title },
        update: { $set: { posterUrl } },
      },
    }));
    const result = await Movie.bulkWrite(operations);

    if (result.matchedCount !== seedMovies.length) {
      throw new Error(
        `Matched ${result.matchedCount} of ${seedMovies.length} expected movies; no new movies were inserted.`
      );
    }

    console.log(`Updated poster URLs for ${result.modifiedCount} movie(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

updateMoviePosters().catch((error) => {
  console.error("Failed to update movie posters:", error);
  process.exitCode = 1;
});
