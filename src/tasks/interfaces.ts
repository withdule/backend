interface Task {
    content: string
    updatedAt: Date
    checked: boolean
    tasklist: string
    user?: string
}

interface NewTask {
    content: string
    updatedAt: Date
    checked: boolean
    tasklist: string
    user: string
}

interface Tasklist {
    name: string
    tasks: string[]
    updatedAt: Date
    _id?: string
    user?: string
}

interface NewTasklist {
    name: string
    tasks: string[]
    updatedAt: Date
}

interface FilledTasklist {
    name: string
    tasks: Task[]
    updatedAt: Date
}



export type {
    Task,
    NewTask,
    Tasklist,
    NewTasklist,
    FilledTasklist
}
