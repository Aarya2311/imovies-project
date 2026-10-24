require("dotenv").config();

const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const { seedMovies } = require("../data/seedMovies");

async function syncMovies() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set in the backend environment.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const operations = seedMovies.map((movie) => ({
      updateOne: {
        filter: { title: movie.title },
        update: { $set: movie },
        upsert: true,
      },
    }));
    const result = await Movie.bulkWrite(operations);
    if (result.matchedCount + result.upsertedCount !== seedMovies.length) {
      throw new Error(
        `Synced ${result.matchedCount + result.upsertedCount} of ${seedMovies.length} sample movies.`
      );
    }

    console.log(
      `Synced ${seedMovies.length} sample movies (${result.upsertedCount} added, ${result.modifiedCount} updated).`
    );
  } finally {
    await mongoose.disconnect();
  }
}

syncMovies().catch((error) => {
  console.error("Failed to sync sample movies:", error);
  process.exitCode = 1;
});
