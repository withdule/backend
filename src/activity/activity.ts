
import {DocumentScope, MangoQuery, Document} from "nano";
import {Indexes} from "./interfaces";
import {Task, Tasklist} from "../tasks/interfaces";
import {Note} from "../notes/interfaces";
import {resourceLimits} from "worker_threads";

class Activity {

    eventsDb: DocumentScope<Event>
    tasklistDb: DocumentScope<Tasklist>
    notesDb: DocumentScope<Note>
    tasksDb: DocumentScope<Task>
    indexes: Indexes

    constructor(eventsDb: DocumentScope<Event>, tasklistDatabase: DocumentScope<Tasklist>, notesDatabase: DocumentScope<Note>, tasksDatabase: DocumentScope<Task>) {
        this.eventsDb = eventsDb
        this.tasklistDb = tasklistDatabase
        this.notesDb = notesDatabase
        this.tasksDb = tasksDatabase
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
        this.notesDb.createIndex({
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
        } as MangoQuery

        return new Promise(resolve => {
            this.eventsDb.find(query, (err, body, headers) => {
                resolve(body.docs)
            })
        })
    }

    async getCompletedTasks(tasklist: string, user: string) {
        const query = {
            selector: {
                user: user,
                tasklist: tasklist,
                checked: true
            },
            fields: ["_id", "updatedAt", "content", "checked"],
            skip: 0,
            execution_stats: false
        } as MangoQuery
        return await new Promise(resolve => {
            this.tasksDb.find(query, (err, body, headers) => {
                resolve(body.docs.length)
            })
        })
    }

    async getRecentActivity(user: string) {
        const query = {
            selector: {
                user: user
            },
            fields: ["_id", "updatedAt", "name", "tasks"],
            skip: 0,
            sort: [
                {'updatedAt': 'desc'},
                {'name': 'desc'}
            ],
            limit: 2,
            use_index: this.indexes.notes,
            execution_stats: false
        } as MangoQuery
        const recentNotes = await new Promise(resolve => {
            this.notesDb.find(query, (err, body, headers) => {
                resolve(body.docs)
            })
        }) as Array<any>

        // Use right index before performing tasklist database request
        query.use_index = this.indexes.tasklist

        const recentUnfilledTasklist = await new Promise(resolve => {
            this.tasklistDb.find(query, (err, body, headers) => {
                resolve(body.docs)
            })
        }) as Array<any>

        const recentTasklist = []

        for (const tasklist of recentUnfilledTasklist) {
            tasklist.isTasklist = true
            tasklist.tasksCompleted = await this.getCompletedTasks(tasklist._id, user)
            tasklist.tasks = tasklist.tasks.length
            recentTasklist.push(tasklist)
        }

        const recentActivity = recentNotes.concat(recentTasklist)
        recentActivity.sort((a, b) => {
            return a.updatedAt > b.updatedAt ? -1 : 1
        })

        return recentActivity
    }
}

export default Activity
