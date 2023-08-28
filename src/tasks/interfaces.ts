interface Task {
    content: string
    updatedAt: Date
    tasklist: string
}

interface NewTask {
    content: string
    updatedAt: Date
    tasklist: string
    user: string
}

interface Tasklist {
    name: string
    tasks: string[]
    updatedAt: Date
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
