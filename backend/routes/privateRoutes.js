const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
} = require("../controllers/userController");
const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  toggleNoteStatus,
} = require("../controllers/noteController");

// Tất cả routes trong file này đều yêu cầu xác thực
router.use(verifyToken);

// Users - Private
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.patch("/users/:id/toggle", toggleUserStatus);

// Notes - Private
router.get("/notes", getAllNotes);
router.get("/notes/:id", getNoteById);
router.post("/notes", createNote);
router.put("/notes/:id", updateNote);
router.patch("/notes/:id/toggle", toggleNoteStatus);

module.exports = router;
