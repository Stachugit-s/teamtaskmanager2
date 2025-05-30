import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import teamRoutes from './routes/teamRoutes'; // Dodajemy import tras zespołów
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import commentRoutes from './routes/commentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
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
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;