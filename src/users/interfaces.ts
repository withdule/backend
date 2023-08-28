interface User {
    email: string
    fullname: string
    password: string
    createdAt: Date
}

interface NewUser {
    email: string
    password: string
    fullname: string
}

interface UpdateUser {
    email: string
    password: string
    fullname: string
}

interface AuthenticationResponse {
    authenticated: boolean
    user: User
}

export type {
    User,
    NewUser,
    UpdateUser,
    AuthenticationResponse
}
