import express from "express";
import Events from "./events";
import couchDB from "../utils/database"
import verifyToken from "../utils/verifyToken";
import { Event } from "./interfaces";

const router = express.Router()
const eventsFactory = new Events(couchDB.db.use('events'))


router.post('/', verifyToken, (req, res) => {
    const event = {
        name: req.body['name'],
        startsAt: req.body['startsAt'],
        endsAt: req.body['endsAt'],
        updatedAt: new Date()
    } as Event
    const insertedEvent = eventsFactory.add(event, req.body.user._id)
    res.status(201).json({
        'message': 'Event created',
        'code': 201,
        'data': insertedEvent
    })
})


router.get('/', verifyToken, async (req, res) => {
    const events = await eventsFactory.getAll(req.body.user._id)
    if (events) {
        res.status(200).json({
            'message': 'Event retrieved successfully',
            'code': 200,
            'data': events
        })
    } else {
        res.status(204).json({
            'message': 'No events found',
            'code': 204
        })
    }
})

router.get('/:id', verifyToken, async (req, res) => {
    const event = await eventsFactory.get(req.params.id, req.body.user._id)
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
        startsAt: req.body['startsAt'],
        endsAt: req.body['endsAt'],
        updatedAt: new Date()
    } as Event
    const newEvent = await eventsFactory.update(req.params.id, event, req.body.user._id)
    if (newEvent) {
        res.status(200).json({
            'message': 'Event modified successfully',
            'code': 200,
            'data': newEvent
        })
    } else {
        res.status(404).json({
            'message': 'Event not found or error occurred.',
            'code': 404
        })
    }
})


router.delete('/:id', verifyToken, async (req, res) => {
    const eventDeleted = await eventsFactory.delete(req.params.id, req.body.user._id)
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
