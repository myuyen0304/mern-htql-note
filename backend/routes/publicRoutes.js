const express = require("express");
const router = express.Router();
const {
  getPublicUsers,
  getPublicUserById,
} = require("../controllers/userController");
const {
  getPublicNotes,
  getPublicNoteById,
} = require("../controllers/noteController");

// Users - Public
router.get("/users", getPublicUsers);
router.get("/users/:id", getPublicUserById);

// Notes - Public
router.get("/notes", getPublicNotes);
router.get("/notes/:id", getPublicNoteById);

module.exports = router;
