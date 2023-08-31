
import {DocumentScope, MangoQuery, Document} from "nano";
import {Indexes} from "./interfaces";
import {Tasklist} from "../tasks/interfaces";
import {Note} from "../notes/interfaces";
import {resourceLimits} from "worker_threads";

class Activity {

    eventsDb: DocumentScope<Event>
    tasklistDb: DocumentScope<Tasklist>
    notesDatabase: DocumentScope<Note>
    indexes: Indexes

    constructor(eventsDb: DocumentScope<Event>, tasklistDatabase: DocumentScope<Tasklist>, notesDatabase: DocumentScope<Note>) {
        this.eventsDb = eventsDb
        this.tasklistDb = tasklistDatabase
        this.notesDatabase = notesDatabase
        this.indexes = {}
        this.eventsDb.createIndex({
            name: 'chrono-order',
            type: 'json',
            index: {
                fields: ['startsAt', 'endsAt']
            }
        },
        (err, response) => {
            this.indexes.events = response.id
        })
        this.tasklistDb.createIndex({
            name: 'chrono-order',
            type: 'json',
            index: {
                fields: [
                    {'updatedAt': 'desc'},
                    {'name': 'desc'}
                ]
            }
        },
        (err, response) => {
            this.indexes.tasklist = response.id
        })
        this.notesDatabase.createIndex({
            name: 'chrono-order',
            type: 'json',
            index: {
                fields: [
                    {'updatedAt': 'desc'},
                    {'name': 'desc'}
                ]
            }
        },
        (err, response) => {
            this.indexes.notes = response.id
        })
    }

    async getIncomingEvents(user: string) {
        const now = new Date()
        const dayEnd = new Date()
        dayEnd.setHours(23, 59, 59, 9999)

        const query = {
            selector: {
                user: user,
                startsAt: {
                    $gt: now,
                    $lt : dayEnd
                }
            },
            fields: ["_id", "updatedAt", "startsAt", "endsAt", "name"],
            skip: 0,
            sort: ['startsAt', 'endsAt'],
            use_index: this.indexes.events,
            execution_stats: false
        }
        return new Promise(resolve => {
            this.eventsDb.find(query, (err, body, headers) => {
                console.log(err)
                console.log(body)
                resolve(body.docs)
            })
        })
    }

    // TODO
    async getRecentActivity(user: string) {
        const query = {
            selector: {
                user: user
            },
            fields: ["_id", "updatedAt", "startsAt", "endsAt", "name"],
            skip: 0,
            sort: [
                {'updatedAt': 'desc'},
                {'name': 'desc'}
            ],
            use_index: this.indexes.events,
            execution_stats: false
        }
    }
}

export default Activity
