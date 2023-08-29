import jwt, {Secret} from "jsonwebtoken";
import express from "express";
import Users from "./users";
import couchDB from "../utils/database"
import verifyToken from "../utils/verifyToken";
import {UpdateUser} from "./interfaces";

const secret = process.env.SECRET as Secret
const router = express.Router()
const usersFactory = new Users(couchDB.db.use('users'), couchDB.db)


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
    res.status(200).send({
        'message': 'Successfully retrieved your account',
        'code': 200,
        'data': {
            'user': req.body.user
        }
    })
})

router.patch('/', verifyToken, async (req, res) => {
    const user = {
        email: req.body['email'],
        fullname: req.body['fullname']
    } as UpdateUser
    const updatedUser = await usersFactory.update(req.body['email'], user, req.body.user._id)
    if (updatedUser) {
        res.status(200).json({
            'message': 'User modified successfully',
            'code': 200,
            'data': updatedUser
        })
    } else {
        res.status(404).json({
            'message': 'User not found or error occurred.',
            'code': 404
        })
    }
})

router.get('/stats', verifyToken, async (req, res) => {
    const statistics = await usersFactory.getStatistics(req.body.user._id)
    res.status(200).send({
        'message': 'Successfully retrieved your account statistics',
        'code': 200,
        'data': statistics
    })
})

export default router
