import jwt, {Secret} from "jsonwebtoken";
import express from "express";
import Users from "./users";
import couchDB from "../utils/database"
import verifyToken from "../utils/verifyToken";

const secret = process.env.SECRET as Secret
const router = express.Router()
const usersFactory = new Users(couchDB.db.use('users'))


router.post('/register', (req, res) => {
    const user = {
        email: req.body['email'],
        password: req.body['password'],
        fullname: req.body['fullname']
    }
    const insertedUser = usersFactory.register(user)
    jwt.sign({ user: insertedUser }, secret, (error: Error | null, token: string | undefined) => {
        res.status(201).json({
            'message': 'Account created successfully !',
            'code': 201,
            'data': {
                user: insertedUser,
                token: token
            }
        })
    })
})

router.post('/login', async (req, res) => {
    const email = req.body['email']
    const password = req.body['password']
    const response = await usersFactory.authenticate(email, password)
    if (response.authenticated) {
        jwt.sign({ user: response.user }, secret, (error: Error | null, token: string | undefined) => {
            res.status(200).json({
                'message': 'Successfully logged in',
                'code': 200,
                'data':  response.user,
                'token': token
            })
        })
    } else {
        res.status(403).json({
            'message': 'Error: wrong password or email !',
            'code': 403
        })
    }
})

router.get('/', verifyToken, (req, res) => {
    // const user = usersFactory.get()
    res.status(200).send({
        'message': 'Successfully retrieved your account',
        'code': 200,
        'data': req.body.user
    })
})

export default router
