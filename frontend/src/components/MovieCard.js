import { useState } from "react";
import { formatPrice } from "../utils/currency";

function MoviePoster({ movie }) {
  const [failed, setFailed] = useState(false);

  if (!movie.posterUrl || failed) {
    return (
      <div
        aria-label={`${movie.title} poster unavailable`}
        className={`poster poster-placeholder poster-art poster-art-${(movie.genre || "other")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}`}
        role="img"
      >
        <span aria-hidden="true" className="poster-monogram">
          {movie.title.trim().charAt(0).toUpperCase()}
        </span>
        <span className="poster-unavailable">Poster unavailable</span>
      </div>
    );
  }

  return (
    <img
      className="poster"
      src={movie.posterUrl}
      alt={`${movie.title} poster`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function releaseLabel(movie) {
  if (movie.releaseDate) {
    const date = new Date(movie.releaseDate);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    }
  }
  return movie.releaseYear ? String(movie.releaseYear) : "";
}

function MovieCard({
  movie,
  selected,
  deleting,
  canManageMovies,
  authLoading,
  onSelect,
  onDelete,
  onBook,
}) {
  const release = releaseLabel(movie);

  return (
    <article className={`movie-card${selected ? " selected" : ""}`}>
      <button
        className="movie-card-select"
        type="button"
        onClick={() => onSelect(movie._id)}
        aria-pressed={selected}
        aria-label={`Select ${movie.title}`}
      >
        <MoviePoster
          key={movie.posterUrl || movie.title}
          movie={movie}
        />
        <span className="movie-info">
          <strong>{movie.title}</strong>
          <span>
            {movie.genre}
            {release ? ` · ${release}` : ""}
          </span>
          <span>{movie.durationMinutes} min</span>
          {movie.description ? <span className="movie-description">{movie.description}</span> : null}
          <span className="movie-price">{formatPrice(movie.price)} / ticket</span>
        </span>
      </button>
      {movie.trailerUrl ? (
        <a
          className="movie-trailer-link"
          href={movie.trailerUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Watch trailer <span aria-hidden="true">↗</span>
        </a>
      ) : null}
      <button
        className="book-ticket-button"
        type="button"
        disabled={authLoading}
        onClick={() => onBook(movie._id)}
      >
        Book Ticket
      </button>
      {canManageMovies ? (
        <button
          className="delete-movie-button"
          type="button"
          disabled={deleting}
          onClick={() => onDelete(movie)}
          aria-label={`Delete ${movie.title}`}
        >
          {deleting ? "Deleting…" : "Delete Movie"}
        </button>
      ) : null}
    </article>
  );
}

export default MovieCard;
