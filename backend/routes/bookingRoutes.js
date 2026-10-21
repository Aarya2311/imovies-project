const express = require("express");
const {
  createBooking,
  listBookings,
  listAdminBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const { requireAuth, requireRole } = require("../middleware/requireAuth");

const router = express.Router();

router.get("/admin", requireAuth, requireRole("admin", "owner"), listAdminBookings);
router.post("/:id/cancel", requireAuth, cancelBooking);
router.route("/").get(requireAuth, listBookings).post(requireAuth, createBooking);

module.exports = router;
