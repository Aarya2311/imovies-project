const Booking = require("../models/Booking");
const Movie = require("../models/Movie");

function movieFields(body) {
  const source = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const fields = [
    "title",
    "description",
    "genre",
    "releaseDate",
    "releaseYear",
    "durationMinutes",
    "rating",
    "price",
    "posterUrl",
    "trailerUrl",
    "showtimes",
  ];

  return Object.fromEntries(
    fields
      .filter((field) => source[field] !== undefined)
      .map((field) => [field, source[field]])
  );
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function listMovies(request, response, next) {
  try {
    const filter = {};
    const search =
      typeof request.query.search === "string" ? request.query.search.trim() : "";
    const genre = typeof request.query.genre === "string" ? request.query.genre.trim() : "";

    if (search) {
      const expression = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ title: expression }, { description: expression }, { genre: expression }];
    }
    if (genre) {
      filter.genre = genre;
    }

    const movies = await Movie.find(filter).sort({ title: 1 }).lean();
    response.json(movies);
  } catch (error) {
    next(error);
  }
}

async function getMovie(request, response, next) {
  try {
    const movie = await Movie.findById(request.params.id).lean();
    if (!movie) {
      return response.status(404).json({ message: "Movie not found." });
    }
    response.json(movie);
  } catch (error) {
    next(error);
  }
}

async function createMovie(request, response, next) {
  try {
    const movie = await Movie.create(movieFields(request.body));
    response.status(201).json(movie);
  } catch (error) {
    next(error);
  }
}

async function updateMovie(request, response, next) {
  try {
    const movie = await Movie.findByIdAndUpdate(
      request.params.id,
      { $set: movieFields(request.body) },
      { new: true, runValidators: true }
    );
    if (!movie) {
      return response.status(404).json({ message: "Movie not found." });
    }
    response.json(movie);
  } catch (error) {
    next(error);
  }
}

async function deleteMovie(request, response, next) {
  try {
    const movie = await Movie.findById(request.params.id);
    if (!movie) {
      return response.status(404).json({ message: "Movie not found." });
    }

    const hasBookings = await Booking.exists({ movie: movie._id });
    if (hasBookings) {
      return response.status(409).json({
        message: "This movie cannot be deleted while bookings exist.",
      });
    }

    await movie.deleteOne();
    response.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = { listMovies, getMovie, createMovie, updateMovie, deleteMovie };
