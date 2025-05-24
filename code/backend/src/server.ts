import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectToDatabase } from './dbConnection/dbConnection';
import cors from 'cors'
import path from 'path';
import ClientRouter from './routes/dashboard/clients';
import ImageRouter from './routes/dashboard/images';
import StudioRouter from './routes/studio/studio';

const app = express();

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use('/clients', ClientRouter);
app.use('/images', ImageRouter);
app.use('/studio', StudioRouter);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to AuraX Studio Dashboard API' });
});

// Start server

const PORT = process.env.PORT || 5001;

const startServer = () => {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (e: NodeJS.ErrnoException) => {
        if (e.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Please use a different port.`);
        } else {
            console.error(`Server error: ${e.message}`);
        }
    });
}

connectToDatabase().then(() => {
    startServer();
});

export default app;
