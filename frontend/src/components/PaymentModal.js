import { useEffect, useRef, useState } from "react";
import { formatPrice } from "../utils/currency";

const paymentMethods = [
  { id: "upi", label: "UPI", description: "Google Pay · PhonePe · Paytm" },
  { id: "card", label: "Credit / Debit Card", description: "Visa · Mastercard · RuPay" },
  { id: "netbanking", label: "Net Banking", description: "Pay through your bank" },
];

function PaymentModal({
  movie,
  seats,
  showDate,
  showtime,
  submitting,
  onClose,
  onPay,
  onComplete,
}) {
  const [method, setMethod] = useState("upi");
  const [upiApp, setUpiApp] = useState("Google Pay");
  const [bank, setBank] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [phase, setPhase] = useState("details");
  const [paymentError, setPaymentError] = useState("");
  const [completedBooking, setCompletedBooking] = useState(null);
  const payButtonRef = useRef(null);
  const total = movie.price * seats;
  const isBusy = phase === "processing" || phase === "payment-confirmed" || submitting;

  useEffect(() => {
    if (phase === "details" || phase === "booking-error" || phase === "booked") {
      payButtonRef.current?.focus();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isBusy && phase !== "booked") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBusy, onClose, phase]);

  function validatePaymentDetails() {
    if (method === "card") {
      const digits = card.number.replace(/\s/g, "");
      if (!/^\d{16}$/.test(digits)) {
        return "Enter the 16-digit demo card number shown below.";
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
        return "Enter the demo card expiry in MM/YY format.";
      }
      if (!/^\d{3,4}$/.test(card.cvv)) {
        return "Enter the 3 or 4 digit demo CVV.";
      }
    }

    if (method === "netbanking" && !bank) {
      return "Choose a bank to continue.";
    }

    return "";
  }

  async function saveBooking() {
    setPaymentError("");
    setPhase("saving");
    try {
      const booking = await onPay(method);
      setCompletedBooking(booking);
      setPhase("booked");
      return booking;
    } catch (bookingError) {
      setPaymentError(bookingError.message);
      setPhase("booking-error");
      return null;
    }
  }

  async function processPayment() {
    const validationError = validatePaymentDetails();
    if (validationError) {
      setPaymentError(validationError);
      return;
    }

    setPaymentError("");
    setPhase("processing");
    await new Promise((resolve) => window.setTimeout(resolve, 2000));
    setPhase("payment-confirmed");
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    await saveBooking();
  }

  function updateCard(event) {
    setCard((current) => ({ ...current, [event.target.name]: event.target.value }));
    setPaymentError("");
  }

  return (
    <div
      className="payment-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isBusy && phase !== "booked") {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby="payment-title"
        aria-modal="true"
        className="payment-modal"
        role="dialog"
      >
        {phase !== "booked" ? (
          <button
            aria-label="Close payment dialog"
            className="payment-close"
            disabled={isBusy}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        ) : null}

        {phase === "processing" ? (
          <div className="payment-state" role="status" aria-live="polite">
            <span className="payment-spinner" aria-hidden="true" />
            <h2 id="payment-title">Processing Payment...</h2>
            <p>Please wait while we securely process your demo payment.</p>
            <p className="payment-total">{formatPrice(total)}</p>
          </div>
        ) : phase === "payment-confirmed" ? (
          <div className="payment-state" role="status" aria-live="polite">
            <span className="payment-check" aria-hidden="true">✓</span>
            <h2 id="payment-title">Payment Confirmed!</h2>
            <p>Saving your booking for {movie.title}…</p>
            <p className="payment-total">{formatPrice(total)}</p>
          </div>
        ) : phase === "saving" || submitting ? (
          <div className="payment-state" role="status" aria-live="polite">
            <span className="payment-spinner" aria-hidden="true" />
            <h2 id="payment-title">Saving your tickets…</h2>
            <p>Your demo payment is confirmed. We’re finishing your booking.</p>
          </div>
        ) : phase === "booked" ? (
          <div className="payment-state" role="status" aria-live="polite">
            <span className="payment-check" aria-hidden="true">✓</span>
            <p className="eyebrow">DEMO PAYMENT COMPLETE</p>
            <h2 id="payment-title">Payment Confirmed &amp; Ticket Booked!</h2>
            <p>{seats} {seats === 1 ? "ticket" : "tickets"} for {movie.title}</p>
            <p className="payment-total">{formatPrice(total)}</p>
            <button
              className="submit-button pay-button"
              onClick={() => onComplete(completedBooking)}
              ref={payButtonRef}
              type="button"
            >
              Done <span aria-hidden="true">✓</span>
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">SECURE CHECKOUT · DEMO ONLY</p>
            <h2 id="payment-title">Complete your payment</h2>

            <div className="ticket-summary">
              <div className="ticket-summary-title">
                <span>{movie.title}</span>
                <span>{seats} {seats === 1 ? "ticket" : "tickets"}</span>
              </div>
              <div className="ticket-summary-row">
                <span>Showtime</span>
                <span>{showDate} · {showtime}</span>
              </div>
              <div className="ticket-summary-row">
                <span>{formatPrice(movie.price)} × {seats} tickets</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="ticket-summary-total">
                <strong>Total to pay</strong>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <div className="payment-methods" aria-label="Mock payment methods">
              {paymentMethods.map((item) => (
                <label
                  className={`payment-method${method === item.id ? " active" : ""}`}
                  key={item.id}
                >
                  <input
                    checked={method === item.id}
                    onChange={() => {
                      setMethod(item.id);
                      setPaymentError("");
                    }}
                    type="radio"
                    name="paymentMethod"
                  />
                  <span className="payment-method-icon" aria-hidden="true">
                    {item.id === "upi" ? "U" : item.id === "card" ? "▰" : "⌂"}
                  </span>
                  <span className="payment-method-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </label>
              ))}
            </div>

            {method === "upi" ? (
              <div className="payment-details-panel">
                <label>
                  UPI app
                  <select value={upiApp} onChange={(event) => setUpiApp(event.target.value)}>
                    <option>Google Pay</option>
                    <option>PhonePe</option>
                    <option>Paytm</option>
                  </select>
                </label>
                <div className="mock-upi-id">
                  <span>Demo UPI ID</span>
                  <strong>imovies.demo@upi</strong>
                </div>
                <p className="payment-hint">
                  Mock {upiApp} payment. No UPI PIN is requested.
                </p>
              </div>
            ) : null}

            {method === "card" ? (
              <div className="payment-details-panel">
                <label>
                  Demo card number
                  <input
                    autoComplete="off"
                    inputMode="numeric"
                    maxLength="19"
                    name="number"
                    onChange={updateCard}
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                  />
                </label>
                <div className="card-detail-row">
                  <label>
                    Expiry
                    <input
                      autoComplete="off"
                      maxLength="5"
                      name="expiry"
                      onChange={updateCard}
                      placeholder="12/30"
                      value={card.expiry}
                    />
                  </label>
                  <label>
                    CVV
                    <input
                      autoComplete="off"
                      inputMode="numeric"
                      maxLength="4"
                      name="cvv"
                      onChange={updateCard}
                      placeholder="123"
                      type="password"
                      value={card.cvv}
                    />
                  </label>
                </div>
                <p className="payment-hint">
                  Demo only: use 4242 4242 4242 4242, 12/30, CVV 123. Never enter
                  real card details. These fields stay in this browser and are not saved.
                </p>
              </div>
            ) : null}

            {method === "netbanking" ? (
              <div className="payment-details-panel">
                <label>
                  Select your bank
                  <select value={bank} onChange={(event) => setBank(event.target.value)}>
                    <option value="">Choose a demo bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="Axis">Axis Bank</option>
                  </select>
                </label>
                <p className="payment-hint">Demo net-banking approval only. No bank login is requested.</p>
              </div>
            ) : null}

            <p className="demo-notice">
              This is a simulated payment gateway. No money is charged and no
              payment credentials are sent to or stored by the server.
            </p>
            {paymentError ? <p className="feedback error" role="alert">{paymentError}</p> : null}
            <button
              className="submit-button pay-button"
              disabled={isBusy}
              onClick={
                phase === "booking-error"
                  ? saveBooking
                  : processPayment
              }
              ref={payButtonRef}
              type="button"
            >
              {phase === "booking-error" ? "Retry booking" : `Pay ${formatPrice(total)} Now`}
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </section>
    </div>
  );
}

export default PaymentModal;
