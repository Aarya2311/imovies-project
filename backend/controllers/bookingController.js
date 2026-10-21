const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Movie = require("../models/Movie");

const cancellationCutoffMs = 5 * 60 * 60 * 1000;

function parseShowtimeDate(showDate, showtime) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(showDate)) {
    return null;
  }

  const dateParts = showDate.split("-").map(Number);
  const match = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i.exec(showtime);
  if (!match) {
    return null;
  }

  const [year, month, day] = dateParts;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const hour12 = Number(match[1]);
  const minutes = Number(match[2]);
  if (hour12 < 1 || hour12 > 12) {
    return null;
  }
  const hour = (hour12 % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  const showtimeAt = new Date(year, month - 1, day, hour, minutes);
  if (
    showtimeAt.getFullYear() !== year ||
    showtimeAt.getMonth() !== month - 1 ||
    showtimeAt.getDate() !== day ||
    showtimeAt.getHours() !== hour ||
    showtimeAt.getMinutes() !== minutes
  ) {
    return null;
  }
  return showtimeAt;
}

function localDateString(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function bookingShowtimeAt(booking) {
  if (booking.showtimeAt) {
    return booking.showtimeAt;
  }
  const fallbackDate = booking.showDate || localDateString(booking.createdAt);
  return parseShowtimeDate(fallbackDate, booking.showtime);
}

function serializeBooking(booking) {
  const result = booking.toObject ? booking.toObject() : booking;
  const showDate = result.showDate || localDateString(result.createdAt);
  return {
    ...result,
    showDate,
    showtimeAt: result.showtimeAt || parseShowtimeDate(showDate, result.showtime),
    status: result.status || "confirmed",
  };
}

async function createBooking(request, response, next) {
  try {
    const body =
      request.body && typeof request.body === "object" && !Array.isArray(request.body)
        ? request.body
        : {};
    const { movie: movieId, showtime, showDate, seats } = body;

    if (!mongoose.isValidObjectId(movieId)) {
      return response.status(400).json({ message: "Choose a valid movie." });
    }
    if (typeof showtime !== "string" || !showtime.trim()) {
      return response.status(400).json({ message: "Choose a showtime." });
    }
    if (typeof showDate !== "string") {
      return response.status(400).json({ message: "Choose a show date." });
    }
    if (!Number.isInteger(seats) || seats < 1 || seats > 10) {
      return response.status(400).json({ message: "Seats must be a whole number from 1 to 10." });
    }

    const showtimeAt = parseShowtimeDate(showDate, showtime.trim());
    if (!showtimeAt) {
      return response.status(400).json({ message: "Choose a valid show date and time." });
    }
    if (showtimeAt.getTime() <= Date.now()) {
      return response.status(400).json({ message: "The selected showtime has already passed." });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return response.status(404).json({ message: "Movie not found." });
    }
    if (!movie.showtimes.includes(showtime.trim())) {
      return response.status(400).json({ message: "Choose a listed showtime." });
    }

    const booking = await Booking.create({
      movie: movie._id,
      user: request.user._id,
      customerName: request.user.name,
      email: request.user.email,
      showtime: showtime.trim(),
      showDate,
      showtimeAt,
      seats,
      ticketPrice: movie.price,
      totalPrice: movie.price * seats,
    });
    await booking.populate("movie", "title genre");
    response.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

async function listBookings(request, response, next) {
  try {
    const bookings = await Booking.find({ user: request.user._id })
      .populate("movie", "title genre")
      .sort({ createdAt: -1 })
      .lean();
    response.json(bookings.map(serializeBooking));
  } catch (error) {
    next(error);
  }
}

async function listAdminBookings(request, response, next) {
  try {
    const bookings = await Booking.find()
      .populate("movie", "title genre")
      .sort({ createdAt: -1 })
      .lean();
    response.json(bookings.map(serializeBooking));
  } catch (error) {
    next(error);
  }
}

async function cancelBooking(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({ message: "Choose a valid booking." });
    }
    const booking = await Booking.findById(request.params.id);
    if (!booking) {
      return response.status(404).json({ message: "Booking not found." });
    }

    const isAdmin = ["admin", "owner"].includes(request.user.role);
    if (!isAdmin && String(booking.user) !== String(request.user._id)) {
      return response.status(403).json({ message: "You can only cancel your own bookings." });
    }
    if ((booking.status || "confirmed") === "cancelled") {
      return response.status(409).json({ message: "This booking has already been cancelled." });
    }
    if (!isAdmin) {
      const showtimeAt = bookingShowtimeAt(booking);
      if (!showtimeAt || showtimeAt.getTime() - Date.now() < cancellationCutoffMs) {
        return response.status(400).json({
          message: "Bookings can only be cancelled at least 5 hours before showtime.",
        });
      }
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    booking.cancelledBy = request.user._id;
    await booking.save();
    await booking.populate("movie", "title genre");
    response.json(serializeBooking(booking));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  listBookings,
  listAdminBookings,
  cancelBooking,
  parseShowtimeDate,
};
