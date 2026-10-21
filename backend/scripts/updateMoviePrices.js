require("dotenv").config();

const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const { seedMovies } = require("../data/seedMovies");

async function updateMoviePrices() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set in the backend environment.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const operations = seedMovies.map(({ title, price }) => ({
      updateOne: {
        filter: { title },
        update: {
          $set: { price },
        },
      },
    }));
    const result = await Movie.bulkWrite(operations);

    if (result.matchedCount !== seedMovies.length) {
      throw new Error(
        `Matched ${result.matchedCount} of ${seedMovies.length} sample movies.`
      );
    }

    console.log(`Updated ticket prices for ${result.modifiedCount} sample movie(s).`);
  } finally {
    await mongoose.disconnect();
  }
}

updateMoviePrices().catch((error) => {
  console.error("Failed to update movie prices:", error);
  process.exitCode = 1;
});
