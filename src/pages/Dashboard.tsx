// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import api from '../api/axios';

// Dodaj do instalacji: npm install recharts

interface DashboardStats {
    totalTeams: number;
    totalProjects: number;
    totalTasks: number;
    userAssignedTasks: number;
    tasksByStatus: {
        todo: number;
        inProgress: number;
        review: number;
        completed: number;
    };
    userTasksByStatus: {
        todo: number;
        inProgress: number;
        review: number;
        completed: number;
    };
    tasksByPriority: {
        low: number;
        medium: number;
        high: number;
    };
    projectsByStatus: {
        planned: number;
        inProgress: number;
        onHold: number;
        completed: number;
    };
    upcomingTasks: any[];
    recentlyCompletedTasks: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (err: any) {
                setError('Nie udało się pobrać danych dashboardu');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
            </Box>
        );
    }

    if (!stats) {
        return (
            <Box>
                <Typography variant="h6">Brak danych do wyświetlenia</Typography>
            </Box>
        );
    }

    // Dane do wykresów
    const taskStatusData = [
        { name: 'Do zrobienia', value: stats.tasksByStatus.todo },
        { name: 'W trakcie', value: stats.tasksByStatus.inProgress },
        { name: 'Przegląd', value: stats.tasksByStatus.review },
        { name: 'Zakończone', value: stats.tasksByStatus.completed },
    ];

    const projectStatusData = [
        { name: 'Planowane', value: stats.projectsByStatus.planned },
        { name: 'W trakcie', value: stats.projectsByStatus.inProgress },
        { name: 'Wstrzymane', value: stats.projectsByStatus.onHold },
        { name: 'Zakończone', value: stats.projectsByStatus.completed },
    ];

    const priorityData = [
        { name: 'Niski', value: stats.tasksByPriority.low },
        { name: 'Średni', value: stats.tasksByPriority.medium },
        { name: 'Wysoki', value: stats.tasksByPriority.high },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            {/* Liczniki */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Zespoły
                        </Typography>
                        <Typography component="p" variant="h3">
                            {stats.totalTeams}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Projekty
                        </Typography>
                        <Typography component="p" variant="h3">
                            {stats.totalProjects}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Wszystkie zadania
                        </Typography>
                        <Typography component="p" variant="h3">
                            {stats.totalTasks}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Twoje zadania
                        </Typography>
                        <Typography component="p" variant="h3">
                            {stats.userAssignedTasks}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Wykresy */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Status zadań
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={taskStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {taskStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Status projektów
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={projectStatusData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Listy zadań */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Nadchodzące zadania
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <List>
                            {stats.upcomingTasks.length > 0 ? (
                                stats.upcomingTasks.map((task) => (
                                    <ListItem key={task._id} component={Link} to={`/tasks/${task._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {task.project.name} • {new Date(task.dueDate).toLocaleDateString()}
                                                    </Typography>
                                                    <br />
                                                    Przypisane do: {task.assignedTo ? task.assignedTo.name : 'Nikogo'}
                                                </>
                                            }
                                        />
                                        <Chip
                                            label={task.priority}
                                            color={
                                                task.priority === 'high'
                                                    ? 'error'
                                                    : task.priority === 'medium'
                                                        ? 'warning'
                                                        : 'success'
                                            }
                                            size="small"
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Brak nadchodzących zadań
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Ostatnio zakończone zadania
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <List>
                            {stats.recentlyCompletedTasks.length > 0 ? (
                                stats.recentlyCompletedTasks.map((task) => (
                                    <ListItem key={task._id} component={Link} to={`/tasks/${task._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                                        <ListItemText
                                            primary={task.title}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {task.project.name}
                                                    </Typography>
                                                    <br />
                                                    Zakończone przez: {task.assignedTo ? task.assignedTo.name : 'Nieznany'}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Brak zakończonych zadań
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;