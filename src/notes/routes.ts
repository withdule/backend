import express from "express";
import Notes from "./notes";
import couchDB from "../utils/database"
import verifyToken from "../utils/verifyToken";
import { Note } from "./interfaces";

const router = express.Router()
const notesFactory = new Notes(couchDB.db.use('notes'))


router.post('/', verifyToken, (req, res) => {
    const note = {
        name: req.body['name'],
        content: req.body['content'],
        updatedAt: new Date()
    } as Note
    const insertedNote = notesFactory.add(note, req.body.user._id)
    res.status(201).json({
        'message': 'Note created',
        'code': 201,
        'data': insertedNote
    })
})


router.get('/', verifyToken, async (req, res) => {
    const notes = await notesFactory.getAll(req.body.user._id)
    if (notes) {
        res.status(200).json({
            'message': 'Notes retrieved successfully',
            'code': 200,
            'data': notes
        })
    } else {
        res.status(204).json({
            'message': 'No notes found',
            'code': 204
        })
    }
})

router.get('/:id', verifyToken, async (req, res) => {
    const event = await notesFactory.get(req.params.id, req.body.user._id)
    if (event) {
        // if (event.) {

        // }
        res.status(200).json({
            'message': 'Event retrieved successfully',
            'code': 200,
            'data': event
        })
    } else {
        res.status(404).json({
            'message': 'Event not found',
            'code': 404
        })
    }
})


router.patch('/:id', verifyToken, async (req, res) => {
    const event = {
        name: req.body['name'],
        content: req.body['content'],
        updatedAt: new Date()
    } as Note
    const newNote = await notesFactory.update(req.params.id, event, req.body.user._id)
    if (newNote) {
        res.status(200).json({
            'message': 'Event modified successfully',
            'code': 200,
            'data': newNote
        })
    } else {
        res.status(404).json({
            'message': 'Event not found or error occurred.',
            'code': 404
        })
    }
})


router.delete('/:id', verifyToken, async (req, res) => {
    const eventDeleted = await notesFactory.delete(req.params.id, req.body.user._id)
    if (eventDeleted) {
        res.status(200).json({
            'message': 'Event deleted successfully',
            'code': 200,
        })
    } else {
        res.status(404).json({
            'message': 'Event not found or error occurred.',
            'code': 404
        })
    }
})


export default router
