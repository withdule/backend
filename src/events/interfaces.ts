interface Event {
    name: string
    startsAt: string
    endsAt: string
    updatedAt: Date
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
