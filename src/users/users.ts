
import {DocumentScope, MangoQuery} from "nano";
import {AuthenticationResponse, NewUser, User} from "./interfaces";

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

    getUser(email: string): Promise<User> {
        const query = {
            selector: {
                email: email
            },
            fields: ["_id", "email", "password", "fullname", "createdAt"],
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
}

export default Users
