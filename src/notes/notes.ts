
import {DocumentScope, MangoQuery, Document} from "nano";
import {NewNote, Note} from "./interfaces";

class Notes {

    db: DocumentScope<Note>

    constructor(database: DocumentScope<Note>) {
        this.db = database
    }

    add(note: Note, user: string) {
        const insertedNote = {
            name: note.name,
            content: note.content,
            updatedAt: note.updatedAt,
            user: user
        } as NewNote
        this.db.insert(insertedNote)
        return note
    }

    async get(id: string, user: string, rev: boolean = false): Promise<Note> {
        const query = {
            selector: {
                _id: id,
                user: user
            },
            fields: rev ? ["_id", "_rev", "updatedAt", "name", "content"] : ["_id", "updatedAt", "name", "content"],
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
            fields: ["_id", "updatedAt", "name", "content"],
            skip: 0,
            execution_stats: false
        } as MangoQuery
        return await new Promise(resolve => {
            this.db.find(query, (err, body, headers) => {
                resolve(body.docs)
            })
        })
    }

    async update(id: string, newNote: Note, user: string): Promise<boolean> {
        const note = await this.get(id, user, true) as Document & Note
        if (!note) return false

        const insertedNewNote = newNote as Document & Note
        insertedNewNote._rev = note._rev

        return await new Promise(resolve => {
            this.db.insert(insertedNewNote, id, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }

    async delete(id: string, user: string): Promise<boolean> {
        const note = await this.get(id, user, true) as Document & Note
        if (!note) return false

        return await new Promise(resolve => {
            this.db.destroy(id, note._rev, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }
}

export default Notes
