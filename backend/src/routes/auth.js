// SENIOR DEV NOTE: Route files should be thin. Their only job is:
//   1. Define the HTTP method + path
//   2. Check that required fields exist in req.body
//   3. Call the appropriate service function
//   4. Return the HTTP response
//
// No bcrypt, no JWT, no SQL here. All of that is in the service.

import { Router } from 'express'
import * as authService from '../services/authService.js'
import authenticate from '../middlewares/authenticate.js'
import { asyncHandler, ValidationError } from '../utils/errors.js'

const router = Router()
// Body: { email, password, name }
// Returns: { success, data: { user, token } }
router.post('/register', asyncHandler(async (req, res) => {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
        throw new ValidationError('email, password, and name are required')
    }
    const { user, token } = await authService.register({ email, password, name })

    res.status(201).json({
        success: true,
        data: { user, token },
    })
}))

router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new ValidationError('email and password are required')
    }
    const { user, token } = await authService.login({ email, password })

    res.status(200).json({
        success: true,
        data: { user, token }
    })
}))

router.get(
    '/me',
    authenticate,
    asyncHandler(async (req, res) => {
        const user = await authService.getMe(req.user.id);

        res.status(200).json({
            success: true,
            data: { user },
        });
    })
);

export default router;