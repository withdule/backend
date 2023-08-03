import {Request, Response} from "express";

function handleRequest(err: Error, req: Request, res: Response, next: Function) {
    switch (req.method) {
        case 'GET':
            console.log(`🪧 [server] GET ${req.url}`)
            break
        case 'POST':
            console.log(`🙌 [server] POST ${req.url}`)
            break
        case 'PATCH':
            console.log(`✏️ [server] PATCH ${req.url}`)
            break
        case 'DELETE':
            console.log(`🗑️ [server] DELETE ${req.url}`)
            break
        case 'PUT':
            console.log(`🗃️ [server] PUT ${req.url}`)
            break
        default:
            console.log(`🐛 [server] ${req.method} ${req.url}`)
    }
    if (err) {
        console.log(`💥 [server] ERROR ${err.name}: ${err.message} ${err.stack}`)
        res.json({
            'message': 'Something went wrong with the server. Are the field filled correctly ?',
            code: 500
        })
        return
    }
    next()
}

export default handleRequest