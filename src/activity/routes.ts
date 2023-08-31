import express from "express";
import Activity from "./activity";
import couchDB from "../utils/database"
import verifyToken from "../utils/verifyToken";
import {DocumentScope} from "nano";
import {Tasklist} from "../tasks/interfaces";
import {Note} from "../notes/interfaces";

const router = express.Router()
const eventsDb = couchDB.db.use('events') as DocumentScope<Event>
const tasklistDb = couchDB.db.use('tasklist') as DocumentScope<Tasklist>
const notesDb = couchDB.db.use('notes') as DocumentScope<Note>
const activityFactory = new Activity(eventsDb, tasklistDb, notesDb)

router.get('/incoming', verifyToken, async (req, res) => {
    const incomingEvents = await activityFactory.getIncomingEvents(req.body.user._id)
    if (incomingEvents) {
        res.status(200).json({
            'message': 'Incoming events retrieved successfully',
            'code': 200,
            'data': incomingEvents
        })
    } else {
        res.status(204).json({
            'message': 'No incoming events',
            'code': 204
        })
    }
})

router.get('/recent', verifyToken, async (req, res) => {
    const recentlyEdited = await activityFactory.getRecentActivity(req.body.user._id)
    if (recentlyEdited) {
        res.status(200).json({
            'message': 'Incoming events retrieved successfully',
            'code': 200,
            'data': recentlyEdited
        })
    } else {
        res.status(204).json({
            'message': 'No recent activity',
            'code': 204
        })
    }
})

export default router
