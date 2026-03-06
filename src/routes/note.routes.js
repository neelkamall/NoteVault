import { Router } from "express";
import {
  createNote,
  getUserNotes,
  getSingleNote,
  updateNote,
  deleteNote
} from "../controllers/note.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Create Note
router.route("/create").post(verifyJWT, createNote);

// Get all notes of logged in user
router.route("/").get(verifyJWT, getUserNotes);

// Get single note
router.route("/:noteId").get(verifyJWT, getSingleNote);

// Update note
router.route("/:noteId").patch(verifyJWT, updateNote);

// Delete note
router.route("/:noteId").delete(verifyJWT, deleteNote);

export default router;