import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import  { handleError, logRequest } from "./handleRequest"
import usersRoutes from "./users/routes"
import eventsRoutes from "./events/routes"

dotenv.config()

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

const port = process.env.PORT

app.use('/', logRequest)
app.use(handleError)
app.get('/', (_, res) => {
    res.send({
        'message': 'Welcome on Dule API',
        'code': 200
    })
})

app.use('/me', usersRoutes)
app.use('/events', eventsRoutes)


app.listen(port, () => {
    console.log(`🚀 [server] API is running at http://localhost:${port}`)
})
