import config from './config/env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { migrate } from './db/migrate.js';
import errorHandler from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';

const app = express()

//                      Security Middleware 
// helmet sets a suite of security-related HTTP headers automatically.
// It's not a silver bullet, but it's free protection against common attacks.

app.use(helmet())


// CORS policy
app.use(
    cors({
        origin: config.NODE_ENV === 'production' ? config.BASE_URL : '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
)

// Request Parsing
app.use(express.json({ limit: '10kb' }))  // body size limit so large attack payloads 
// express.urlencoded() is middleware that parses URL-encoded form data from 
// HTTP requests and makes it available in req.body
app.use(express.urlencoded({ extended: false }))  

// Health Check
// Rendering any load balancer / uptime monitor
// This MUST be fast — no DB calls, no complex logic. Just confirm the process is alive.
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
    })
})

// API Routes
app.use('/api/auth', authRouter)


app.use(errorHandler)

async function bootstrap() {
    try {
        await migrate()

        app.listen(config.PORT, ()=>{
            console.log(`[App] Server running on port ${config.PORT} in ${config.NODE_ENV} mode`)
            console.log(`[APP] Base URL: ${config.BASE_URL}`)
        })
    } catch (err) {
        console.error('[App] Failed to start: ', err.message)
        process.exit(1)
    }
}

bootstrap()

export default app