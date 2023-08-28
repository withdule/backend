import { Request, Response, NextFunction } from "express";


function logRequest(req: Request, res: Response, next: NextFunction) {
    console.log(`⮕  [server] ${req.method} ${req.url}`)
    next()
}


function handleError(error: Error, req: Request, res: Response, next: NextFunction) {
    console.log(error)
    if (error) {
        console.log(`💥 [server] ERROR ${error.name}: ${error.message}`)
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