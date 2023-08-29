interface Event {
    name: string
    startsAt: string
    endsAt: string
    updatedAt: Date
    user?: string
}

interface NewEvent {
    name: string
    startsAt: string
    endsAt: string
    updatedAt: Date
    user: string
}

export type {
    Event,
    NewEvent
}
