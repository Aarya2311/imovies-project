import MovieGrid from "./MovieGrid";

function MovieCatalog({
  visibleMovies,
  search,
  genre,
  genres,
  onSearchChange,
  onGenreChange,
  selectedMovieId,
  deletingMovieId,
  canManageMovies,
  authLoading,
  onSelect,
  onDelete,
  onBook,
}) {
  return (
    <>
      <div className="movie-filters">
        <label className="search-field">
          <span className="visually-hidden">Search movies</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search titles and genres"
          />
        </label>
        <label className="genre-field">
          <span className="visually-hidden">Filter by genre</span>
          <select value={genre} onChange={(event) => onGenreChange(event.target.value)}>
            <option value="">All genres</option>
            {genres.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <MovieGrid
        movies={visibleMovies}
        selectedMovieId={selectedMovieId}
        deletingMovieId={deletingMovieId}
        canManageMovies={canManageMovies}
        authLoading={authLoading}
        onSelect={onSelect}
        onDelete={onDelete}
        onBook={onBook}
      />
    </>
  );
}

export default MovieCatalog;
