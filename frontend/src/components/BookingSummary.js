import { useState } from "react";
import { formatPrice } from "../utils/currency";

const cancellationCutoffMs = 5 * 60 * 60 * 1000;

function getShowtimeTimestamp(booking) {
  if (booking.showtimeAt) {
    const timestamp = new Date(booking.showtimeAt).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }
  const date = booking.showDate ||
    (booking.createdAt ? new Date(booking.createdAt).toISOString().slice(0, 10) : "");
  const match = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i.exec(booking.showtime || "");
  if (!date || !match) {
    return null;
  }
  const hour12 = Number(match[1]);
  if (hour12 < 1 || hour12 > 12) {
    return null;
  }
  const hour = (hour12 % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return Date.parse(`${date}T${String(hour).padStart(2, "0")}:${match[2]}:00Z`);
}

function formatShowDate(value) {
  if (!value) {
    return "";
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

function BookingSummary({
  bookings,
  loading,
  error,
  authenticated,
  authLoading,
  onSignIn,
  onRetry,
  onCancelBooking,
}) {
  const [cancellingBookingId, setCancellingBookingId] = useState("");
  const [cancellationError, setCancellationError] = useState("");

  async function cancel(booking) {
    setCancellingBookingId(booking._id);
    setCancellationError("");
    try {
      await onCancelBooking(booking._id);
    } catch (cancelError) {
      setCancellationError(cancelError.message);
    } finally {
      setCancellingBookingId("");
    }
  }

  return (
    <section className="booking-summary" aria-labelledby="booking-summary-title">
      <div className="booking-summary-heading">
        <div>
          <p className="eyebrow">YOUR ORDERS</p>
          <h2 id="booking-summary-title">Booking summary</h2>
        </div>
        {authenticated && !loading ? (
          <span className="booking-summary-count">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
          </span>
        ) : null}
      </div>

      {authLoading ? (
        <p className="status" role="status">Checking your sign-in…</p>
      ) : !authenticated ? (
        <div className="booking-summary-empty">
          <h3>Sign in to view your bookings</h3>
          <p>Your confirmed tickets will appear here after you sign in.</p>
          <button className="retry-button" onClick={onSignIn} type="button">
            Sign in
          </button>
        </div>
      ) : loading && bookings.length === 0 ? (
        <p className="status" role="status">Loading your bookings…</p>
      ) : error && bookings.length === 0 ? (
        <div className="booking-summary-error">
          <p className="feedback error" role="alert">{error}</p>
          <button className="retry-button" disabled={loading} onClick={onRetry} type="button">
            {loading ? "Retrying…" : "Retry"}
          </button>
          {/\b401\b|log in|login|session/i.test(error) ? (
            <button className="text-button" onClick={onSignIn} type="button">
              Sign in again
            </button>
          ) : null}
        </div>
      ) : bookings.length === 0 ? (
        <div className="booking-summary-empty">
          <h3>No bookings yet</h3>
          <p>Your confirmed movie tickets will appear here.</p>
          {error ? <p className="feedback error" role="alert">{error}</p> : null}
          {error ? (
            <button className="retry-button" disabled={loading} onClick={onRetry} type="button">
              {loading ? "Retrying…" : "Retry"}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {loading ? <p className="status" role="status">Refreshing your bookings…</p> : null}
          {error ? <p className="feedback error" role="alert">{error}</p> : null}
          {error ? (
            <button className="retry-button" disabled={loading} onClick={onRetry} type="button">
              {loading ? "Retrying…" : "Retry"}
            </button>
          ) : null}
          {cancellationError ? (
            <p className="feedback error" role="alert">{cancellationError}</p>
          ) : null}
          <div className="booking-summary-list">
            {bookings.map((booking) => {
              const bookingDate = booking.createdAt
                ? new Date(booking.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "";
              const showDate = booking.showDate ||
                (booking.createdAt ? new Date(booking.createdAt).toISOString().slice(0, 10) : "");
              const showtimeAt = getShowtimeTimestamp(booking);
              const canCancel = booking.status !== "cancelled" &&
                showtimeAt !== null &&
                showtimeAt - Date.now() >= cancellationCutoffMs;
              return (
                <article className="booking-order-card" key={booking._id}>
                  <div className="booking-order-title">
                    <div>
                      <p className="eyebrow">TICKET ORDER</p>
                      <h3>{booking.movie?.title || "Movie unavailable"}</h3>
                    </div>
                    <strong className="booking-order-total">{formatPrice(booking.totalPrice)}</strong>
                  </div>
                  <div className="booking-order-details">
                    <span>{booking.seats} {booking.seats === 1 ? "ticket" : "tickets"}</span>
                    <span>Show: {formatShowDate(showDate)} · {booking.showtime}</span>
                    {booking.movie?.genre ? <span>{booking.movie.genre}</span> : null}
                    {bookingDate ? <span>Booked {bookingDate}</span> : null}
                  </div>
                  <div className="booking-order-footer">
                    <span>Ticket price · {formatPrice(booking.ticketPrice)}</span>
                    <span className={`booking-order-status${booking.status === "cancelled" ? " cancelled" : ""}`}>
                      {booking.status === "cancelled" ? "Cancelled" : "Confirmed"}
                    </span>
                  </div>
                  {booking.status === "cancelled" ? null : canCancel ? (
                    <button
                      className="booking-cancel-button"
                      disabled={cancellingBookingId === booking._id}
                      onClick={() => cancel(booking)}
                      type="button"
                    >
                      {cancellingBookingId === booking._id ? "Cancelling…" : "Cancel booking"}
                    </button>
                  ) : (
                    <p className="booking-cancellation-hint">
                      Customer cancellation closes 5 hours before showtime.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export default BookingSummary;
