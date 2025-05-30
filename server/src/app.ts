import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import teamRoutes from './routes/teamRoutes'; // Dodajemy import tras zespołów

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API działa');
});

app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes); // Dodajemy trasy zespołów

export default app;