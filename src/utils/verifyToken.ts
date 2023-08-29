import {Request, Response} from "express";
import jwt, {Secret} from "jsonwebtoken";

const secret = process.env.SECRET as Secret

export default function (req: Request, res: Response, next: Function) {
    const tokenHeader = req.headers['authorization'] as string
    if (tokenHeader) {
        const token = tokenHeader.split(' ')[1]
        jwt.verify(token, secret, (err, data) => {
            if (err) {
                res.status(403).json({
                    'message': 'Access forbidden',
                    'code': 403
                })
            } else {
                // @ts-ignore - Data will always be JwtPayload here
                req.body.user = data['user']
            }
        })
        next()
    } else {
        res.status(401).json({
            'message': 'Not authorized',
            'code': 401
        })
    }
}
