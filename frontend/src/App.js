import { useEffect, useMemo, useState } from "react";
import AddMovieForm from "./components/AddMovieForm";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import BookingSummary from "./components/BookingSummary";
import BookingForm from "./components/BookingForm";
import MovieCatalog from "./components/MovieCatalog";
import {
  cancelBooking,
  deleteMovie,
  getBookings,
  getAdminBookings,
  getCurrentUser,
  getMovies,
  logoutUser,
} from "./services/api";
import "./index.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [addMovieOpen, setAddMovieOpen] = useState(false);
  const [deletingMovieId, setDeletingMovieId] = useState("");
  const [managementMessage, setManagementMessage] = useState("");
  const [managementError, setManagementError] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState("login");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [bookingFocusRequest, setBookingFocusRequest] = useState(0);
  const [resumePaymentRequest, setResumePaymentRequest] = useState(0);
  const [authResumeAction, setAuthResumeAction] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingsReload, setBookingsReload] = useState(0);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminBookingsLoading, setAdminBookingsLoading] = useState(false);
  const [adminBookingsError, setAdminBookingsError] = useState("");
  const [adminBookingsReload, setAdminBookingsReload] = useState(0);
  const canManageMovies = user?.role === "admin" || user?.role === "owner";

  function openAuthModal(mode = "login", resumeAction = null) {
    setAuthInitialMode(mode);
    setAuthResumeAction(resumeAction);
    setAuthModalOpen(true);
  }

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((result) => {
        if (active) {
          if (result.user) {
            setBookingsLoading(true);
          }
          setUser(result.user);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setManagementError("Could not check your login status. You can still browse movies.");
        }
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMovies() {
      setLoading(true);
      setError("");
      try {
        const result = await getMovies({ signal: controller.signal });
        setMovies(result);
        setSelectedMovieId((current) =>
          result.some((movie) => movie._id === current) ? current : ""
        );
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMovies();
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setBookingsError("");
      setBookingsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setBookingsLoading(true);
    setBookingsError("");

    getBookings({ signal: controller.signal })
      .then((result) => {
        if (active) {
          setBookings(result);
        }
      })
      .catch((loadError) => {
        if (active && loadError.name !== "AbortError") {
          setBookingsError(loadError.message);
        }
      })
      .finally(() => {
        if (active) {
          setBookingsLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [user?.id, bookingsReload]);

  useEffect(() => {
    if (!dashboardOpen || !canManageMovies) {
      setAdminBookings([]);
      setAdminBookingsError("");
      setAdminBookingsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setAdminBookingsLoading(true);
    setAdminBookingsError("");

    getAdminBookings({ signal: controller.signal })
      .then((result) => {
        if (active) {
          setAdminBookings(result);
        }
      })
      .catch((loadError) => {
        if (active && loadError.name !== "AbortError") {
          setAdminBookingsError(loadError.message);
        }
      })
      .finally(() => {
        if (active) {
          setAdminBookingsLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [dashboardOpen, canManageMovies, adminBookingsReload]);

  const genres = useMemo(
    () => [...new Set(movies.map((movie) => movie.genre).filter(Boolean))].sort(),
    [movies]
  );
  const visibleMovies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return movies.filter((movie) => {
      const matchesGenre = !genre || movie.genre === genre;
      const matchesSearch =
        !query ||
        [movie.title, movie.genre, movie.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      return matchesGenre && matchesSearch;
    });
  }, [genre, movies, search]);

  function handleMovieAdded(createdMovie) {
    if (!canManageMovies) {
      setManagementError("You do not have permission to manage movies.");
      return;
    }
    setMovies((current) =>
      [...current, createdMovie].sort((first, second) =>
          first.title.localeCompare(second.title)
      )
    );
    setSelectedMovieId(createdMovie._id);
    setGenre("");
    setSearch("");
    setAddMovieOpen(false);
    setManagementError("");
    setManagementMessage(`${createdMovie.title} was added to the movie list.`);
  }

  function handleBookMovie(movieId) {
    setSelectedMovieId(movieId);
    setProfileMenuOpen(false);
    if (!user) {
      openAuthModal("login", "booking");
      return;
    }
    setBookingFocusRequest((request) => request + 1);
    document.querySelector(".booking-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function handleAuthenticated(authenticatedUser) {
    setBookingsLoading(true);
    setBookingsError("");
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    const resumeAction = authResumeAction;
    setAuthResumeAction(null);
    if (resumeAction) {
      if (resumeAction === "payment") {
        setResumePaymentRequest((request) => request + 1);
      } else {
        setBookingFocusRequest((request) => request + 1);
      }
      window.setTimeout(() => {
        document.querySelector(".booking-form")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 0);
    }
  }

  async function handleLogout() {
    setManagementError("");
    try {
      await logoutUser();
      setUser(null);
      setDashboardOpen(false);
      setManagementMessage("You’ve been logged out.");
    } catch (logoutError) {
      setManagementError(logoutError.message);
    }
  }

  async function handleMovieDelete(movie) {
    if (!canManageMovies) {
      setManagementError("You do not have permission to manage movies.");
      return;
    }
    if (!window.confirm(`Delete "${movie.title}" from the movie list?`)) {
      return;
    }

    setDeletingMovieId(movie._id);
    setManagementMessage("");
    setManagementError("");
    try {
      await deleteMovie(movie._id);
      setMovies((current) => current.filter((item) => item._id !== movie._id));
      setSelectedMovieId((current) => current === movie._id ? "" : current);
      setManagementMessage(`${movie.title} was deleted.`);
    } catch (requestError) {
      setManagementError(requestError.message);
    } finally {
      setDeletingMovieId("");
    }
  }

  function handleBookingSaved(booking) {
    setBookings((current) => [
      booking,
      ...current.filter((item) => item._id !== booking._id),
    ]);
    setBookingsError("");
    setBookingsReload((current) => current + 1);
  }

  async function handleCustomerBookingCancel(bookingId) {
    const cancelledBooking = await cancelBooking(bookingId);
    setBookings((current) =>
      current.map((booking) =>
        booking._id === cancelledBooking._id ? cancelledBooking : booking
      )
    );
    return cancelledBooking;
  }

  async function handleAdminBookingCancel(bookingId) {
    const cancelledBooking = await cancelBooking(bookingId);
    setAdminBookings((current) =>
      current.map((booking) =>
        booking._id === cancelledBooking._id ? cancelledBooking : booking
      )
    );
    setBookings((current) =>
      current.map((booking) =>
        booking._id === cancelledBooking._id ? cancelledBooking : booking
      )
    );
    return cancelledBooking;
  }

  return (
    <main className="page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="iMovies home">
          <img
            src="/am-logo.png"
            alt=""
            aria-hidden="true"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid #00e676",
            }}
          />
          <span>iMovies</span>
        </a>
        <div className="header-actions">
          <span className="header-note">Your next movie night starts here</span>
          {!user ? (
            <div className="auth-actions">
              <button
                className="auth-action auth-action-secondary"
                disabled={authLoading}
                onClick={() => openAuthModal("login")}
                type="button"
              >
                Sign In
              </button>
              <button
                className="auth-action auth-action-primary"
                disabled={authLoading}
                onClick={() => openAuthModal("signup")}
                type="button"
              >
                Sign Up
              </button>
            </div>
          ) : null}
          <div className={`profile-menu-wrap${profileMenuOpen ? " menu-open" : ""}`}>
            <button
              aria-expanded={profileMenuOpen}
              aria-haspopup={user ? "menu" : undefined}
              aria-label={user ? `Account menu for ${user.name}` : "Log in or sign up"}
              className={`profile-trigger${user ? " signed-in" : " signed-out"}`}
              disabled={authLoading}
              onClick={() => {
                if (user) {
                  setProfileMenuOpen((open) => !open);
                } else {
                  openAuthModal("login");
                }
              }}
              type="button"
            >
              {user ? (
                <>
                  <span className="profile-avatar" aria-hidden="true">
                    {user.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="profile-trigger-name">{user.name}</span>
                  <svg aria-hidden="true" className="profile-chevron" viewBox="0 0 16 16">
                    <path d="m4 6 4 4 4-4" />
                  </svg>
                </>
              ) : (
                <svg aria-hidden="true" className="profile-icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c.6-3.4 3.2-5.5 7-5.5s6.4 2.1 7 5.5" />
                </svg>
              )}
            </button>
            {user && profileMenuOpen ? (
              <>
                <button
                  aria-label="Close account menu"
                  className="profile-menu-dismiss"
                  onClick={() => setProfileMenuOpen(false)}
                  tabIndex="-1"
                  type="button"
                />
                <div className="profile-dropdown" role="menu">
                  <div className="profile-dropdown-user">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  {canManageMovies ? (
                    <button
                      className="profile-dashboard"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setDashboardOpen(true);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      Admin dashboard
                    </button>
                  ) : null}
                  <button
                    className="profile-logout"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    role="menuitem"
                    type="button"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {dashboardOpen && canManageMovies ? (
        <AdminDashboard
          bookings={adminBookings}
          bookingsLoading={adminBookingsLoading}
          bookingsError={adminBookingsError}
          movies={movies}
          onCancelBooking={handleAdminBookingCancel}
          onBack={() => setDashboardOpen(false)}
          onBookingsRetry={() => setAdminBookingsReload((current) => current + 1)}
        />
      ) : (
        <>
      <section className="hero">
        <p className="eyebrow">THE BIG SCREEN IS CALLING</p>
        <h1>Make it a movie night.</h1>
        <p className="hero-copy">
          Find your next favorite and save your seats in just a few clicks.
        </p>
        <div className="hero-actions">
          <button
            className="auth-action auth-action-primary"
            disabled={authLoading}
            onClick={() => openAuthModal("signup")}
            type="button"
          >
            Get started <span aria-hidden="true">→</span>
          </button>
          <button
            className="hero-signin"
            disabled={authLoading}
            onClick={() => openAuthModal("login")}
            type="button"
          >
            Already a member? Sign in
          </button>
        </div>
      </section>

      <section className="booking-layout" aria-label="Movie booking">
        <div className="movie-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">NOW SHOWING</p>
              <h2>Pick your picture</h2>
            </div>
            <div className="catalogue-actions">
              {canManageMovies ? (
                <button
                  className="add-movie-toggle"
                  type="button"
                  aria-expanded={addMovieOpen}
                  onClick={() => {
                    setAddMovieOpen((open) => !open);
                    setManagementError("");
                  }}
                >
                  {addMovieOpen ? "Close" : "+ Add Movie"}
                </button>
              ) : null}
              <span className="film-icon" aria-hidden="true">▶</span>
            </div>
          </div>

          {canManageMovies && addMovieOpen ? (
            <AddMovieForm
              onMovieAdded={handleMovieAdded}
              onCancel={() => setAddMovieOpen(false)}
            />
          ) : null}
          {managementError ? (
            <p className="feedback error" role="alert">{managementError}</p>
          ) : null}
          {managementMessage ? (
            <p className="feedback success" role="status">{managementMessage}</p>
          ) : null}

          {loading ? (
            <p className="status" role="status">Loading movies…</p>
          ) : error ? (
            <div className="empty-state" role="alert">
              <h3>Movies couldn’t be loaded</h3>
              <p>{error}</p>
              <button
                className="retry-button"
                type="button"
                onClick={() => setReload((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : movies.length === 0 ? (
            <div className="empty-state">
              <span aria-hidden="true">🍿</span>
              <h3>No movies just yet</h3>
              <p>Check back soon for what’s playing.</p>
            </div>
          ) : (
            <MovieCatalog
              visibleMovies={visibleMovies}
              search={search}
              genre={genre}
              genres={genres}
              onSearchChange={setSearch}
              onGenreChange={setGenre}
              selectedMovieId={selectedMovieId}
              deletingMovieId={deletingMovieId}
              canManageMovies={canManageMovies}
              authLoading={authLoading}
              onSelect={setSelectedMovieId}
              onDelete={handleMovieDelete}
              onBook={handleBookMovie}
            />
          )}
        </div>

        <BookingForm
          movies={movies}
          selectedMovieId={selectedMovieId}
          onMovieChange={setSelectedMovieId}
          user={user}
          authLoading={authLoading}
          focusRequest={bookingFocusRequest}
          resumePaymentRequest={resumePaymentRequest}
          onAuthRequired={() => {
            openAuthModal("login", "payment");
          }}
          onBookingSaved={handleBookingSaved}
        />
      </section>
      <BookingSummary
        bookings={bookings}
        loading={bookingsLoading}
        error={bookingsError}
        authenticated={Boolean(user)}
        authLoading={authLoading}
        onSignIn={() => openAuthModal("login")}
        onRetry={() => setBookingsReload((current) => current + 1)}
        onCancelBooking={handleCustomerBookingCancel}
      />
        </>
      )}

      <footer>© {new Date().getFullYear()} iMovies. Your seat is waiting.</footer>
      {authModalOpen ? (
        <AuthModal
          initialMode={authInitialMode}
          onAuthenticated={handleAuthenticated}
          onClose={() => {
            setAuthModalOpen(false);
            setAuthResumeAction(null);
          }}
        />
      ) : null}
    </main>
  );
}

export default App;
