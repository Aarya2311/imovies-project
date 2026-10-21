import MovieCard from "./MovieCard";

function MovieGrid({
  movies,
  selectedMovieId,
  deletingMovieId,
  canManageMovies,
  authLoading,
  onSelect,
  onDelete,
  onBook,
}) {
  if (movies.length === 0) {
    return (
      <div className="empty-state">
        <span aria-hidden="true">⌕</span>
        <h3>No matching movies</h3>
        <p>Try another title or genre.</p>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie._id}
          movie={movie}
          selected={selectedMovieId === movie._id}
          deleting={deletingMovieId === movie._id}
          canManageMovies={canManageMovies}
          authLoading={authLoading}
          onSelect={onSelect}
          onDelete={onDelete}
          onBook={onBook}
        />
      ))}
    </div>
  );
}

export default MovieGrid;
