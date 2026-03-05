import jwt from 'jsonwebtoken'
import db from '../db/connection.js'
import config from '../config/env.js'

import { UnauthorizedError } from '../utils/errors.js'

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Authentication required. Provide a Bearer token')
        }

        const token = authHeader.split(' ')[1]
        if(!token) {
            throw new UnauthorizedError('Authentication token is missing')
        }

        // verify the JWT signature
        // jwt.verify throws if the token is incalid or expired
        let decoded
        try {
            decoded = jwt.verify(token, config.JWT_SECRET)
        } catch (jwtErr) {
            throw jwtErr
        }
        
        const user = await db.getAsync(
            `SELECT id, email, name, created_at FROM users WHERE id = ?`,
            [decoded.sub]
        )
        if(!user) {
            throw new UnauthorizedError('User no longer exists')
        }
        req.user = user

        next()

    } catch(err) {
        next(err)
    }
}

export default authenticate