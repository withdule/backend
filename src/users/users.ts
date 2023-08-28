
import {Document, DocumentScope, MangoQuery} from "nano";
import {AuthenticationResponse, NewUser, UpdateUser, User} from "./interfaces";

class Users {

    db: DocumentScope<User>

    constructor(database: DocumentScope<User>) {
        this.db = database
    }

    async authenticate(email: string, password: string): Promise<AuthenticationResponse>  {
        const user = await this.getUser(email)
        const authenticated = user.password == password
        user.password = 'Removed'
        return { authenticated: authenticated, user: user }
    }

    register(user: NewUser): User {
        const insertedUser = {
            fullname: user.fullname,
            email: user.email,
            password: user.password,
            createdAt: new Date()
        } as User
        this.db.insert(insertedUser)
        return insertedUser
    }

    getUser(email: string, rev: boolean = false): Promise<User> {
        const query = {
            selector: {
                email: email
            },
            fields: rev ? ["_id", "_rev", "email", "password", "fullname", "createdAt"] : ["_id", "email", "password", "fullname", "createdAt"],
            skip: 0,
            limit: 1,
            execution_stats: false
        } as MangoQuery
        return new Promise(resolve => {
            this.db.find(query, (err, body, headers) => {
                resolve(body.docs[0])
            })
        })
    }

    async update(email: string, newUser: UpdateUser, id: string): Promise<boolean> {
        const user = await this.getUser(email, true) as Document & User
        if (!user) return false

        const insertedNewUser = user as Document & User
        insertedNewUser.email = newUser.email
        insertedNewUser.fullname = newUser.fullname
        insertedNewUser._rev = user._rev

        return await new Promise(resolve => {
            this.db.insert(insertedNewUser, id, (err, body, headers) => {
                if (body) resolve(body.ok)
                resolve(false)
            })
        })
    }
}

export default Users
