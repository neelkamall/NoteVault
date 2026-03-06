import { Note } from "../models/note.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Create Note
export const createNote = asyncHandler(async (req, res) => {

    const { title, content } = req.body

    if (!title || !content) {
        return res.status(400).json({
            message: "Title and content are required"
        })
    }

    const note = await Note.create({
        title,
        content,
        owner: req.user._id
    })

    return res.status(201).json({
        success: true,
        message: "Note created successfully",
        note
    })

})


// Get All Notes of Logged In User
export const getAllNotes = asyncHandler(async (req, res) => {

    const notes = await Note.find({
        owner: req.user._id
    }).sort({ createdAt: -1 })

    return res.status(200).json({
        success: true,
        notes
    })

})


// Get Single Note
export const getSingleNote = asyncHandler(async (req, res) => {

    const { id } = req.params

    const note = await Note.findOne({
        _id: id,
        owner: req.user._id
    })

    if (!note) {
        return res.status(404).json({
            message: "Note not found"
        })
    }

    return res.status(200).json({
        success: true,
        note
    })

})


// Update Note
export const updateNote = asyncHandler(async (req, res) => {

    const { id } = req.params
    const { title, content } = req.body

    const note = await Note.findOneAndUpdate(
        {
            _id: id,
            owner: req.user._id
        },
        {
            $set: {
                title,
                content
            }
        },
        {
            new: true
        }
    )

    if (!note) {
        return res.status(404).json({
            message: "Note not found"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Note updated successfully",
        note
    })

})


// Delete Note
export const deleteNote = asyncHandler(async (req, res) => {

    const { id } = req.params

    const note = await Note.findOneAndDelete({
        _id: id,
        owner: req.user._id
    })

    if (!note) {
        return res.status(404).json({
            message: "Note not found"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Note deleted successfully"
    })

})