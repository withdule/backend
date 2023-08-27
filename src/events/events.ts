
import {DocumentScope, MangoQuery, Document} from "nano";
import {Event, NewEvent} from "./interfaces";

class Events {

    db: DocumentScope<Event>

    constructor(database: DocumentScope<Event>) {
        this.db = database
    }

    add(event: Event, user: string) {
        const insertedEvent = {
            name: event.name,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            updatedAt: event.updatedAt,
            user: user
        } as NewEvent
        this.db.insert(insertedEvent)
        return event
    }

    async get(id: string, user: string, rev: boolean = false): Promise<Event> {
        const query = {
            selector: {
                _id: id,
                user: user
            },
            fields: rev ? ["_id", "_rev", "updatedAt", "name", "startsAt", "endsAt"] : ["_id", "updatedAt", "name", "startsAt", "endsAt"],
            skip: 0,
            limit: 1,
            execution_stats: false
        } as MangoQuery
        return await new Promise(resolve => {
            this.db.find(query, (err, body, headers) => {
                resolve(body.docs[0])
            })
        })
    }

    async getAll(user: string) {
        const query = {
            selector: {
                user: user
            },
            fields: ["_id", "updatedAt", "name", "startsAt", "endsAt"],
            skip: 0,
            execution_stats: false
        } as MangoQuery
        return await new Promise(resolve => {
            this.db.find(query, (err, body, headers) => {
                resolve(body.docs)
            })
        })
    }

    async update(id: string, newEvent: Event, user: string): Promise<boolean> {
        const event = await this.get(id, user, true) as Document & Event
        if (!event) return false

        const insertedNewEvent = newEvent as Document & Event
        insertedNewEvent._rev = event._rev

        return await new Promise(resolve => {
            this.db.insert(insertedNewEvent, id, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }

    async delete(id: string, user: string): Promise<boolean> {
        const event = await this.get(id, user, true) as Document & Event
        if (!event) return false

        return await new Promise(resolve => {
            this.db.destroy(id, event._rev, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }
}

export default Events
