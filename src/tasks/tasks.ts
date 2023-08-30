
import {DocumentScope, MangoQuery, Document} from "nano";
import {Tasklist, Task, NewTask, NewTasklist, FilledTasklist} from "./interfaces";

class Tasks {

    db: DocumentScope<Task>
    tasklistDb: DocumentScope<Tasklist>
    indexId: string

    constructor(database: DocumentScope<Task>, tasklistDatabase: DocumentScope<Tasklist>) {
        this.db = database
        this.tasklistDb = tasklistDatabase
        this.indexId = ""
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
            this.indexId = response.id
        })
    }

    add(task: Task, user: string) {
        const insertedTask = {
            content: task.content,
            tasklist: task.tasklist,
            updatedAt: task.updatedAt,
            checked: false,
            user: user
        } as NewTask
        this.db.insert(insertedTask, (err, res) => {
            if (task.tasklist !== 'unordered') {
                this.getTasklist(task.tasklist, user, true).then(tasklist => {
                    tasklist.tasks.push(res.id)
                    this.updateTasklist(task.tasklist, tasklist, user)
                })
            }
        })

        return task
    }

    addTasklist(tasklist: Tasklist, user: string) {
        const insertedTasklist = {
            name: tasklist.name,
            tasks: tasklist.tasks,
            updatedAt: tasklist.updatedAt,
            user: user
        } as NewTasklist
        this.tasklistDb.insert(insertedTasklist)
        return tasklist
    }

    async getFilledTasklist(user: string) {
        const tasklistQuery = {
            selector: {
                user: user
            },
            fields: ["_id", "updatedAt", "tasks", "name"],
            skip: 0,
            sort: [
                {'updatedAt': 'desc'},
                {'name': 'desc'}
            ],
            use_index: this.indexId,
            execution_stats: false
        } as MangoQuery
        const allTasklist = await new Promise(resolve => {
            this.tasklistDb.find(tasklistQuery, (err, body, headers) => {
                resolve(body.docs)
            })
        }) as Tasklist[]


        let response = []

        for (const tasklist of allTasklist) {
            let newTasklist = {
                name: tasklist.name,
                updatedAt: tasklist.updatedAt,
                _id: tasklist._id,
                tasks: []
            } as any & FilledTasklist
            for (const task of tasklist.tasks) {
               const taskObject = await this.get(task, user)
                newTasklist.tasks.push(taskObject)
            }
            response.push(newTasklist)
        }

        const unorderedTasklist = {
            name: "Unordered",
            tasks: await this.getUnorderedTasks(user),
            _id: 'unordered',
            updatedAt: new Date()
        } as FilledTasklist

        response.unshift(unorderedTasklist)

        return response
    }

    async getTasklist(id: string, user: string, rev: boolean = false): Promise<Tasklist> {
        const query = {
            selector: {
                _id: id,
                user: user
            },
            fields: rev ? ["_id", "_rev", "updatedAt", "name", "tasks", "user"] : ["_id", "updatedAt", "name", "tasks"],
            skip: 0,
            limit: 1,
            execution_stats: false
        } as MangoQuery
        return await new Promise(resolve => {
            this.tasklistDb.find(query, (err, body, headers) => {
                resolve(body.docs[0])
            })
        })
    }

    async getUserTasklist(user: string, rev: boolean = false): Promise<Tasklist[]> {
        const query = {
            selector: {
                user: user
            },
            fields: rev ? ["_id", "_rev", "updatedAt", "name", "tasks"] : ["_id", "updatedAt", "name", "tasks"],
            skip: 0,
            execution_stats: false
        } as MangoQuery
        return await new Promise(resolve => {
            this.tasklistDb.find(query, (err, body, headers) => {
                resolve(body.docs)
            })
        })
    }

    async get(id: string, user: string, rev: boolean = false): Promise<Task> {
        const query = {
            selector: {
                _id: id,
                user: user
            },
            fields: rev ? ["_id", "_rev", "updatedAt", "tasklist", "content", "checked", "user"] : ["_id", "updatedAt", "tasklist", "content", "checked"],
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

    async getUnorderedTasks(user: string, rev: boolean = false): Promise<Task[]> {
        const query = {
            selector: {
                user: user,
                tasklist: 'unordered'
            },
            fields: rev ? ["_id", "_rev", "updatedAt", "tasklist", "content", "checked", "user"] : ["_id", "updatedAt", "tasklist", "content", "checked"],
            skip: 0,
            execution_stats: false
        } as MangoQuery
        return await new Promise(resolve => {
            this.db.find(query, (err, body, headers) => {
                resolve(body.docs)
            })
        })
    }


    async updateTasklist(id: string, newTasklist: Tasklist, user: string): Promise<boolean> {
        const tasklist = await this.getTasklist(id, user, true) as Document & Tasklist
        if (!tasklist) return false

        const insertedNewTasklist = newTasklist as Document & Tasklist
        insertedNewTasklist._rev = tasklist._rev
        insertedNewTasklist.user = tasklist.user
        insertedNewTasklist.updatedAt = new Date()

        return await new Promise(resolve => {
            this.tasklistDb.insert(insertedNewTasklist, id, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }

    async update(id: string, newTask: Task, user: string): Promise<boolean> {
        const task = await this.get(id, user, true) as Document & Task
        if (!task) return false

        const insertedNewTask = newTask as Document & Task
        insertedNewTask._rev = task._rev
        insertedNewTask.user = task.user

        return await new Promise(resolve => {
            this.db.insert(insertedNewTask, id, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }

    // TODO : Bug; need two execution to delete completely the tasklist
    async deleteTasklist(id: string, user: string): Promise<boolean> {
        const tasklist = await this.getTasklist(id, user, true) as Document & Tasklist
        if (!tasklist) return false

        for (const task of tasklist.tasks) {
            await this.delete(task, user, true)
        }

        return await new Promise(resolve => {
            this.tasklistDb.destroy(id, tasklist._rev, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }

    async delete(id: string, user: string, ignoreTasklist: boolean = false): Promise<boolean> {
        const task = await this.get(id, user, true) as Document & Task
        if (!task) return false

        if (task.tasklist !== 'unordered' && ! ignoreTasklist) {
            const tasklist = await this.getTasklist(task.tasklist, user)
            tasklist.tasks.splice(tasklist.tasks.indexOf(task._id), 1)
            await this.updateTasklist(task.tasklist, tasklist, user)
        }

        return await new Promise(resolve => {
            this.db.destroy(id, task._rev, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }
}

export default Tasks
