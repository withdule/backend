import { Request, Response, NextFunction } from "express";


function logRequest(req: Request, res: Response, next: NextFunction) {
    console.log(`⮕  [server] ${req.method} ${req.url}`)
    next()
}


function handleError(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err)
    if (err) {
        console.log(`💥 [server] ERROR ${err.name}: ${err.message} ${err.stack}`)
        res.json({
            'message': 'Something went wrong with the server. Are the field filled correctly ?',
            code: 500
        })
    }
}

export {
    logRequest,
    handleError
}