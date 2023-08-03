import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import handleRequest from "./handleRequest";
import usersRoutes from "./users/routes"

dotenv.config()

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(handleRequest)

const port = process.env.PORT

app.get('/', (_, res) => {
    res.send({
        'message': 'Welcome on Dule API',
        'code': 200
    })
})

app.use('/me', usersRoutes)

app.listen(port, () => {
    console.log(`⚡️ [server] API is running at http://localhost:${port}`)
})
