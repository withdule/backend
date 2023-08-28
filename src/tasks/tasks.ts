
import {DocumentScope, MangoQuery, Document} from "nano";
import {Tasklist, Task, NewTask, NewTasklist, FilledTasklist} from "./interfaces";

class Tasks {

    db: DocumentScope<Task>
    tasklistDb: DocumentScope<Tasklist>

    constructor(database: DocumentScope<Task>, tasklistDatabase: DocumentScope<Tasklist>) {
        this.db = database
        this.tasklistDb = tasklistDatabase
    }

    add(task: Task, user: string) {
        const insertedTask = {
            content: task.content,
            tasklist: task.tasklist,
            updatedAt: task.updatedAt,
            checked: false,
            user: user
        } as NewTask
        this.db.insert(insertedTask)
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
            execution_stats: false
        } as MangoQuery
        const allTasklist = await new Promise(resolve => {
            this.tasklistDb.find(tasklistQuery, (err, body, headers) => {
                resolve(body.docs)
            })
        }) as Tasklist[]


        let response = []

        allTasklist.forEach((tasklist: Tasklist) => {
            let newTasklist = tasklist as any & FilledTasklist
            newTasklist.tasks = []
            tasklist.tasks.forEach(async task => {
                newTasklist.tasks.push(await this.get(task, user))
            })
            response.push(newTasklist)
        })

        const unorderedTasklist = {
            name: "Unordered",
            tasks: await this.getUnorderedTasks(user),
            updatedAt: new Date()
        } as FilledTasklist

        response.push(unorderedTasklist)

        return response
    }

    async getTasklist(user: string, rev: boolean = false): Promise<Tasklist[]> {
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
            fields: rev ? ["_id", "_rev", "updatedAt", "tasklist", "content", "checked"] : ["_id", "updatedAt", "tasklist", "content", "checked"],
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
            fields: rev ? ["_id", "_rev", "updatedAt", "tasklist", "content", "checked"] : ["_id", "updatedAt", "tasklist", "content", "checked"],
            skip: 0,
            limit: 1,
            execution_stats: false
        } as MangoQuery
        return await new Promise(resolve => {
            this.db.find(query, (err, body, headers) => {
                resolve(body.docs)
            })
        })
    }


    async update(id: string, newTask: Task, user: string): Promise<boolean> {
        const task = await this.get(id, user, true) as Document & Task
        if (!task) return false

        const insertedNewTask = newTask as Document & Task
        insertedNewTask._rev = task._rev

        return await new Promise(resolve => {
            this.db.insert(insertedNewTask, id, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }

    async delete(id: string, user: string): Promise<boolean> {
        const task = await this.get(id, user, true) as Document & Task
        if (!task) return false

        return await new Promise(resolve => {
            this.db.destroy(id, task._rev, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }
}

export default Tasks
