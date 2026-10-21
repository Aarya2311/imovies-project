import { useState } from "react";

const emptyMovie = {
  title: "",
  description: "",
  posterUrl: "",
  genres: "",
  releaseDate: "",
  durationMinutes: "",
  trailerUrl: "",
};

const emptyShow = {
  movieTitle: "",
  theater: "",
  date: "",
  time: "",
};

const emptyTheater = {
  name: "",
  location: "",
  screens: "",
};

function AdminDashboard({
  movies,
  bookings,
  bookingsLoading,
  bookingsError,
  onCancelBooking,
  onBookingsRetry,
  onBack,
}) {
  const [activeForm, setActiveForm] = useState("");
  const [localMovies, setLocalMovies] = useState([]);
  const [removedMovieIds, setRemovedMovieIds] = useState([]);
  const [shows, setShows] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [movieFields, setMovieFields] = useState(emptyMovie);
  const [showFields, setShowFields] = useState(emptyShow);
  const [theaterFields, setTheaterFields] = useState(emptyTheater);
  const [message, setMessage] = useState("");
  const [bookingActionError, setBookingActionError] = useState("");
  const [cancellingBookingId, setCancellingBookingId] = useState("");

  const visibleMovies = [
    ...movies.filter((movie) => !removedMovieIds.includes(movie._id)),
    ...localMovies,
  ];

  function formatReleaseDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
  }

  function setForm(form) {
    setActiveForm((current) => current === form ? "" : form);
    setMessage("");
  }

  function addMovie(event) {
    event.preventDefault();
    const movie = {
      ...movieFields,
      _id: `preview-${Date.now()}`,
      genres: movieFields.genres.split(",").map((genre) => genre.trim()).filter(Boolean),
    };
    setLocalMovies((current) => [movie, ...current]);
    setMovieFields(emptyMovie);
    setActiveForm("");
    setMessage(`${movie.title} was added to this dashboard preview.`);
  }

  function addShow(event) {
    event.preventDefault();
    const show = { ...showFields, id: `preview-show-${Date.now()}` };
    setShows((current) => [show, ...current]);
    setShowFields(emptyShow);
    setActiveForm("");
    setMessage(`Show for ${show.movieTitle} was added to this dashboard preview.`);
  }

  function addTheater(event) {
    event.preventDefault();
    const theater = { ...theaterFields, id: `preview-theater-${Date.now()}` };
    setTheaters((current) => [theater, ...current]);
    setTheaterFields(emptyTheater);
    setActiveForm("");
    setMessage(`${theater.name} was added to this dashboard preview.`);
  }

  function removeMovie(movie) {
    if (movie._id.startsWith("preview-")) {
      setLocalMovies((current) => current.filter((item) => item._id !== movie._id));
    } else {
      setRemovedMovieIds((current) => [...current, movie._id]);
    }
  }

  async function cancelBooking(booking) {
    setCancellingBookingId(booking._id);
    setBookingActionError("");
    try {
      await onCancelBooking(booking._id);
    } catch (error) {
      setBookingActionError(error.message);
    } finally {
      setCancellingBookingId("");
    }
  }

  function formatBookingDate(value) {
    if (!value) {
      return "Date unavailable";
    }
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
  }

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <div className="admin-dashboard-heading">
        <div>
          <p className="eyebrow">MOVIE OPERATIONS</p>
          <h1 id="admin-dashboard-title">Admin dashboard</h1>
          <p className="admin-dashboard-copy">
            Manage your catalogue, screenings, and theater locations.
          </p>
        </div>
        <button className="text-button" onClick={onBack} type="button">
          Back to movies
        </button>
      </div>

      <p className="admin-preview-notice" role="note">
        Preview mode: changes are temporary and will be discarded when you leave this dashboard.
      </p>

      <div className="admin-metrics" aria-label="Dashboard totals">
        <div className="admin-metric">
          <span>Movies</span>
          <strong>{visibleMovies.length}</strong>
        </div>
        <div className="admin-metric">
          <span>Shows</span>
          <strong>{shows.length}</strong>
        </div>
        <div className="admin-metric">
          <span>Theaters</span>
          <strong>{theaters.length}</strong>
        </div>
      </div>

      <div className="admin-dashboard-actions" aria-label="Create content">
        <button
          aria-expanded={activeForm === "movie"}
          className={`admin-action-card${activeForm === "movie" ? " active" : ""}`}
          onClick={() => setForm("movie")}
          type="button"
        >
          <span className="admin-action-icon" aria-hidden="true">＋</span>
          <span><strong>Add Movie</strong><small>Update the movie catalogue</small></span>
          <span aria-hidden="true">→</span>
        </button>
        <button
          aria-expanded={activeForm === "show"}
          className={`admin-action-card${activeForm === "show" ? " active" : ""}`}
          onClick={() => setForm("show")}
          type="button"
        >
          <span className="admin-action-icon" aria-hidden="true">◷</span>
          <span><strong>Add Show</strong><small>Schedule a screening</small></span>
          <span aria-hidden="true">→</span>
        </button>
        <button
          aria-expanded={activeForm === "theater"}
          className={`admin-action-card${activeForm === "theater" ? " active" : ""}`}
          onClick={() => setForm("theater")}
          type="button"
        >
          <span className="admin-action-icon" aria-hidden="true">▦</span>
          <span><strong>Add Theater</strong><small>Register a location</small></span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {activeForm === "movie" ? (
        <form className="admin-form-panel" onSubmit={addMovie}>
          <div className="admin-form-heading">
            <div>
              <p className="eyebrow">CATALOGUE</p>
              <h2>Add Movie</h2>
            </div>
            <button className="text-button" onClick={() => setForm("")} type="button">Close</button>
          </div>
          <div className="admin-form-grid">
            <label>
              Title
              <input
                maxLength="200"
                onChange={(event) => setMovieFields({ ...movieFields, title: event.target.value })}
                required
                value={movieFields.title}
              />
            </label>
            <label>
              Genres <span className="admin-field-hint">(comma separated)</span>
              <input
                maxLength="200"
                onChange={(event) => setMovieFields({ ...movieFields, genres: event.target.value })}
                placeholder="Drama, Thriller"
                required
                value={movieFields.genres}
              />
            </label>
            <label className="admin-form-wide">
              Description
              <textarea
                maxLength="2000"
                onChange={(event) => setMovieFields({ ...movieFields, description: event.target.value })}
                required
                rows="3"
                value={movieFields.description}
              />
            </label>
            <label>
              Poster URL
              <input
                maxLength="1000"
                onChange={(event) => setMovieFields({ ...movieFields, posterUrl: event.target.value })}
                required
                type="url"
                value={movieFields.posterUrl}
              />
            </label>
            <label>
              Release date
              <input
                onChange={(event) => setMovieFields({ ...movieFields, releaseDate: event.target.value })}
                required
                type="date"
                value={movieFields.releaseDate}
              />
            </label>
            <label>
              Duration (minutes)
              <input
                max="600"
                min="1"
                onChange={(event) => setMovieFields({ ...movieFields, durationMinutes: event.target.value })}
                required
                type="number"
                value={movieFields.durationMinutes}
              />
            </label>
            <label>
              Trailer URL
              <input
                maxLength="1000"
                onChange={(event) => setMovieFields({ ...movieFields, trailerUrl: event.target.value })}
                required
                type="url"
                value={movieFields.trailerUrl}
              />
            </label>
          </div>
          <button className="submit-button" type="submit">
            Add Movie <span aria-hidden="true">→</span>
          </button>
        </form>
      ) : null}

      {activeForm === "show" ? (
        <form
          className="admin-form-panel"
          onSubmit={addShow}
        >
          <div className="admin-form-heading">
            <div>
              <p className="eyebrow">SCHEDULING</p>
              <h2>Add Show</h2>
            </div>
            <button className="text-button" onClick={() => setForm("")} type="button">Close</button>
          </div>
          <div className="admin-form-grid">
            <label>
              Movie
              <select
                onChange={(event) => setShowFields({ ...showFields, movieTitle: event.target.value })}
                required
                value={showFields.movieTitle}
              >
                <option value="">Select a movie</option>
                {visibleMovies.map((movie) => (
                  <option key={movie._id} value={movie.title}>{movie.title}</option>
                ))}
              </select>
            </label>
            <label>
              Theater
              <input
                maxLength="160"
                onChange={(event) => setShowFields({ ...showFields, theater: event.target.value })}
                required
                value={showFields.theater}
              />
            </label>
            <label>
              Date
              <input
                onChange={(event) => setShowFields({ ...showFields, date: event.target.value })}
                required
                type="date"
                value={showFields.date}
              />
            </label>
            <label>
              Start time
              <input
                onChange={(event) => setShowFields({ ...showFields, time: event.target.value })}
                required
                type="time"
                value={showFields.time}
              />
            </label>
          </div>
          <button className="submit-button" disabled={visibleMovies.length === 0} type="submit">
            Add Show <span aria-hidden="true">→</span>
          </button>
          {visibleMovies.length === 0 ? (
            <p className="admin-empty-hint">Add a movie before scheduling a show.</p>
          ) : null}
        </form>
      ) : null}

      {activeForm === "theater" ? (
        <form className="admin-form-panel" onSubmit={addTheater}>
          <div className="admin-form-heading">
            <div>
              <p className="eyebrow">LOCATIONS</p>
              <h2>Add Theater</h2>
            </div>
            <button className="text-button" onClick={() => setForm("")} type="button">Close</button>
          </div>
          <div className="admin-form-grid">
            <label>
              Theater name
              <input
                maxLength="160"
                onChange={(event) => setTheaterFields({ ...theaterFields, name: event.target.value })}
                required
                value={theaterFields.name}
              />
            </label>
            <label>
              Location
              <input
                maxLength="240"
                onChange={(event) => setTheaterFields({ ...theaterFields, location: event.target.value })}
                required
                value={theaterFields.location}
              />
            </label>
            <label>
              Number of screens
              <input
                max="100"
                min="1"
                onChange={(event) => setTheaterFields({ ...theaterFields, screens: event.target.value })}
                required
                type="number"
                value={theaterFields.screens}
              />
            </label>
          </div>
          <button className="submit-button" type="submit">
            Add Theater <span aria-hidden="true">→</span>
          </button>
        </form>
      ) : null}

      {message ? <p className="admin-feedback" role="status">{message}</p> : null}

      <section className="admin-movie-section" aria-labelledby="admin-movies-title">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">CATALOGUE</p>
            <h2 id="admin-movies-title">Movie management</h2>
          </div>
          <span className="admin-count">{visibleMovies.length} titles</span>
        </div>
        {visibleMovies.length ? (
          <div className="admin-movie-grid">
            {visibleMovies.map((movie) => {
              const genres = Array.isArray(movie.genres)
                ? movie.genres
                : (movie.genre || "").split(",").map((genre) => genre.trim()).filter(Boolean);
              const description = movie.description || "No description added yet.";
              return (
                <article className="admin-movie-card" key={movie._id}>
                  {movie.posterUrl ? (
                    <img className="admin-movie-poster" src={movie.posterUrl} alt={`${movie.title} poster`} />
                  ) : (
                    <div aria-hidden="true" className="admin-movie-poster admin-poster-placeholder">
                      {movie.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="admin-movie-details">
                    <div className="admin-movie-title-row">
                      <h3>{movie.title}</h3>
                      <button
                        aria-label={`Remove ${movie.title} from dashboard preview`}
                        className="admin-remove-button"
                        onClick={() => removeMovie(movie)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="admin-movie-meta">
                      {genres.join(" · ") || "Genre not specified"}
                      {movie.durationMinutes ? ` · ${movie.durationMinutes} min` : ""}
                    </p>
                    <p className="admin-movie-description">{description}</p>
                    {movie.releaseDate ? (
                      <p className="admin-movie-meta">
                        Release date: {formatReleaseDate(movie.releaseDate)}
                      </p>
                    ) : movie.releaseYear ? (
                      <p className="admin-movie-meta">Release year: {movie.releaseYear}</p>
                    ) : null}
                    {movie.trailerUrl ? (
                      <a
                        className="admin-trailer-link"
                        href={movie.trailerUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Watch trailer ↗
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty-state">
            <h3>No movies to manage yet</h3>
            <p>Add a title to see it appear in the dashboard catalogue.</p>
          </div>
        )}
      </section>

      <div className="admin-record-lists">
        <section className="admin-record-panel admin-bookings-panel" aria-labelledby="admin-bookings-title">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">CUSTOMER ORDERS</p>
              <h2 id="admin-bookings-title">Booking management</h2>
            </div>
            <span className="admin-count">{bookings.length} bookings</span>
          </div>
          {bookingsError ? (
            <div className="feedback error" role="alert">
              <p>{bookingsError}</p>
              <button className="retry-button" onClick={onBookingsRetry} type="button">
                Try again
              </button>
            </div>
          ) : bookingsLoading ? (
            <p className="admin-empty-hint" role="status">Loading customer bookings…</p>
          ) : bookings.length ? (
            <div className="admin-booking-list">
              {bookings.map((booking) => (
                <article className="admin-booking-row" key={booking._id}>
                  <div>
                    <strong>{booking.movie?.title || "Movie unavailable"}</strong>
                    <span>{booking.customerName} · {booking.email}</span>
                    <span>
                      {formatBookingDate(booking.showDate)} · {booking.showtime} · {booking.seats} seats
                    </span>
                  </div>
                  <div className="admin-booking-actions">
                    <span className={`booking-order-status${booking.status === "cancelled" ? " cancelled" : ""}`}>
                      {booking.status === "cancelled" ? "Cancelled" : "Confirmed"}
                    </span>
                    {booking.status === "cancelled" ? null : (
                      <button
                        className="booking-cancel-button"
                        disabled={cancellingBookingId === booking._id}
                        onClick={() => cancelBooking(booking)}
                        type="button"
                      >
                        {cancellingBookingId === booking._id ? "Cancelling…" : "Cancel booking"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="admin-empty-hint">No customer bookings yet.</p>
          )}
          {bookingActionError ? (
            <p className="feedback error" role="alert">{bookingActionError}</p>
          ) : null}
        </section>

        <section className="admin-record-panel" aria-labelledby="admin-shows-title">
          <div className="admin-section-heading">
            <h2 id="admin-shows-title">Shows</h2>
            <span className="admin-count">{shows.length}</span>
          </div>
          {shows.length ? shows.map((show) => (
            <p className="admin-record-row" key={show.id}>
              <strong>{show.movieTitle}</strong>
              <span>{show.theater} · {show.date} at {show.time}</span>
            </p>
          )) : <p className="admin-empty-hint">No shows added in this preview.</p>}
        </section>
        <section className="admin-record-panel" aria-labelledby="admin-theaters-title">
          <div className="admin-section-heading">
            <h2 id="admin-theaters-title">Theaters</h2>
            <span className="admin-count">{theaters.length}</span>
          </div>
          {theaters.length ? theaters.map((theater) => (
            <p className="admin-record-row" key={theater.id}>
              <strong>{theater.name}</strong>
              <span>{theater.location} · {theater.screens} screens</span>
            </p>
          )) : <p className="admin-empty-hint">No theaters added in this preview.</p>}
        </section>
      </div>
    </section>
  );
}

export default AdminDashboard;
