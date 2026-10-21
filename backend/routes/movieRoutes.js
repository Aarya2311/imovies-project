const express = require("express");
const {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");
const { requireAuth, requireRole } = require("../middleware/requireAuth");

const router = express.Router();
const requireMovieManager = [requireAuth, requireRole("admin", "owner")];

router.route("/").get(listMovies).post(...requireMovieManager, createMovie);
router.route("/:id")
  .get(getMovie)
  .put(...requireMovieManager, updateMovie)
  .delete(...requireMovieManager, deleteMovie);

module.exports = router;
