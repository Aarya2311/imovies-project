import { useCallback, useEffect, useRef, useState } from "react";
import { createBooking } from "../services/api";
import { formatPrice } from "../utils/currency";
import PaymentModal from "./PaymentModal";

const initialFields = {
  showtime: "",
  showDate: "",
  seats: "1",
};

function getLocalDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function BookingForm({
  movies,
  selectedMovieId,
  onMovieChange,
  user,
  authLoading,
  focusRequest,
  resumePaymentRequest,
  onAuthRequired,
  onBookingSaved,
}) {
  const [fields, setFields] = useState(initialFields);
  const [submitting, setSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const showtimeRef = useRef(null);
  const selectedMovie = movies.find((movie) => movie._id === selectedMovieId);

  useEffect(() => {
    if (focusRequest > 0) {
      showtimeRef.current?.focus({ preventScroll: true });
    }
  }, [focusRequest]);

  useEffect(() => {
    if (resumePaymentRequest > 0 && user && selectedMovie) {
      setPaymentOpen(true);
    }
  }, [resumePaymentRequest, selectedMovie, user]);

  function updateField(event) {
    setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
    setConfirmation("");
  }

  function selectMovie(event) {
    onMovieChange(event.target.value);
    setFields((current) => ({ ...current, showtime: "" }));
    setConfirmation("");
  }

  function submitBooking(event) {
    event.preventDefault();
    setConfirmation("");
    if (!user) {
      onAuthRequired();
      return;
    }
    setPaymentOpen(true);
  }

  const closePayment = useCallback(() => {
    if (!submitting) {
      setPaymentOpen(false);
    }
  }, [submitting]);

  async function payAndBook() {
    setSubmitting(true);
    try {
      const booking = await createBooking({
        ...fields,
        movie: selectedMovieId,
        seats: Number(fields.seats),
      });
      onBookingSaved(booking);
      return booking;
    } finally {
      setSubmitting(false);
    }
  }

  function completeBooking(booking) {
    setConfirmation(
      `Payment Confirmed & Ticket Booked! ${booking.seats} ` +
        `${booking.seats === 1 ? "ticket" : "tickets"} for ${booking.movie.title} ` +
        `on ${booking.showDate} at ${booking.showtime}. ` +
        `Total paid: ${formatPrice(booking.totalPrice)}.`
    );
    setFields((current) => ({
      ...initialFields,
      showtime: current.showtime,
    }));
    setPaymentOpen(false);
  }

  return (
    <form className="booking-form" onSubmit={submitBooking}>
      <p className="eyebrow">RESERVE YOUR SEATS</p>
      <h2>Book tickets</h2>
      <label>
        Movie
        <select required value={selectedMovieId} onChange={selectMovie}>
          <option value="">Choose a movie</option>
          {movies.map((movie) => (
            <option key={movie._id} value={movie._id}>{movie.title}</option>
          ))}
        </select>
      </label>
      <label>
        Show date
        <input
          min={getLocalDateValue()}
          name="showDate"
          onChange={updateField}
          required
          type="date"
          value={fields.showDate}
        />
      </label>
      <label>
        Show time
        <select
          ref={showtimeRef}
          name="showtime"
          required
          value={fields.showtime}
          onChange={updateField}
          disabled={!selectedMovie}
        >
          <option value="">Choose a show time</option>
          {selectedMovie?.showtimes?.map((showtime) => (
            <option key={showtime} value={showtime}>{showtime}</option>
          ))}
        </select>
      </label>
      <div className="form-row">
        <label>
          Seats
          <input
            max="10"
            min="1"
            name="seats"
            onChange={updateField}
            required
            type="number"
            value={fields.seats}
          />
        </label>
      </div>
      {confirmation ? <p className="feedback success" role="status">{confirmation}</p> : null}
      <button
        className="submit-button"
        disabled={!selectedMovie || submitting || authLoading}
        type="submit"
      >
        {submitting ? "Booking…" : "Continue to payment"}
        <span aria-hidden="true">→</span>
      </button>
      <p className="fine-print">A great night out, one click away.</p>
      {paymentOpen && selectedMovie ? (
        <PaymentModal
          movie={selectedMovie}
          seats={Number(fields.seats)}
          showDate={fields.showDate}
          showtime={fields.showtime}
          submitting={submitting}
          onClose={closePayment}
          onPay={payAndBook}
          onComplete={completeBooking}
        />
      ) : null}
    </form>
  );
}

export default BookingForm;
