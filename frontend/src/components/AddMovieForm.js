import { useState } from "react";
import { createMovie } from "../services/api";

const initialFields = {
  title: "",
  genre: "",
  releaseDate: "",
  releaseYear: "",
  durationMinutes: "",
  price: "",
  rating: "",
  posterUrl: "",
  trailerUrl: "",
  description: "",
  showtimes: "",
};

function AddMovieForm({ onMovieAdded, onCancel }) {
  const [fields, setFields] = useState(initialFields);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
  }

  async function submitMovie(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const movie = {
      title: fields.title.trim(),
      genre: fields.genre.trim(),
      durationMinutes: Number(fields.durationMinutes),
      price: Number(fields.price),
      description: fields.description.trim(),
      posterUrl: fields.posterUrl.trim(),
      showtimes: fields.showtimes.split(",").map((time) => time.trim()).filter(Boolean),
    };

    if (fields.releaseYear) {
      movie.releaseYear = Number(fields.releaseYear);
    }
    if (fields.releaseDate) {
      movie.releaseDate = fields.releaseDate;
    }
    if (fields.rating) {
      movie.rating = Number(fields.rating);
    }
    if (fields.trailerUrl.trim()) {
      movie.trailerUrl = fields.trailerUrl.trim();
    }

    try {
      const createdMovie = await createMovie(movie);
      setFields(initialFields);
      onMovieAdded(createdMovie);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="add-movie-form" onSubmit={submitMovie}>
      <div className="add-movie-heading">
        <div>
          <p className="eyebrow">CATALOGUE</p>
          <h3>Add a movie</h3>
        </div>
        <button className="text-button" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <div className="add-movie-fields">
        <label>
          Title
          <input
            autoFocus
            maxLength="200"
            name="title"
            onChange={updateField}
            required
            value={fields.title}
          />
        </label>
        <label>
          Genre
          <input
            maxLength="80"
            name="genre"
            onChange={updateField}
            required
            value={fields.genre}
          />
        </label>
        <label>
          Duration (minutes)
          <input
            max="600"
            min="1"
            name="durationMinutes"
            onChange={updateField}
            required
            type="number"
            value={fields.durationMinutes}
          />
        </label>
        <label>
          Ticket price (₹)
          <input
            max="100000"
            min="1"
            name="price"
            onChange={updateField}
            required
            type="number"
            value={fields.price}
          />
        </label>
        <label>
          Release year
          <input
            max="2200"
            min="1888"
            name="releaseYear"
            onChange={updateField}
            type="number"
            value={fields.releaseYear}
          />
        </label>
        <label>
          Release date
          <input
            name="releaseDate"
            onChange={updateField}
            type="date"
            value={fields.releaseDate}
          />
        </label>
        <label>
          Rating (0–10)
          <input
            max="10"
            min="0"
            name="rating"
            onChange={updateField}
            step="0.1"
            type="number"
            value={fields.rating}
          />
        </label>
        <label>
          Trailer URL (optional)
          <input
            maxLength="1000"
            name="trailerUrl"
            onChange={updateField}
            placeholder="https://www.youtube.com/watch?v=..."
            type="url"
            value={fields.trailerUrl}
          />
        </label>
        <label>
          Movie Poster Image Link (optional)
          <input
            maxLength="1000"
            name="posterUrl"
            onChange={updateField}
            placeholder="https://example.com/movie-poster.jpg"
            type="url"
            value={fields.posterUrl}
          />
        </label>
        <label className="add-movie-wide">
          Showtimes (comma separated)
          <input
            maxLength="500"
            name="showtimes"
            onChange={updateField}
            placeholder="1:30 PM, 5:15 PM, 9:00 PM"
            value={fields.showtimes}
          />
        </label>
        <label className="add-movie-wide">
          Description
          <textarea
            maxLength="2000"
            name="description"
            onChange={updateField}
            rows="3"
            value={fields.description}
          />
        </label>
      </div>
      {error ? <p className="feedback error" role="alert">{error}</p> : null}
      <button className="submit-button" disabled={submitting} type="submit">
        {submitting ? "Adding movie…" : "Save movie"}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

export default AddMovieForm;
