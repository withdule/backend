interface Note {
    name: string
    content: string
    updatedAt: Date
    user?: string
}

interface NewNote {
    name: string
    content: string
    updatedAt: Date
    user: string
}

export type {
    Note,
    NewNote
}
