// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    Chip,
    Button,
    Avatar,
    IconButton,
    LinearProgress,
    Stack,
    useTheme,
    Tooltip,
    Alert,
    AlertTitle,
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    Add as AddIcon,
    ArrowForward as ArrowForwardIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as AccessTimeIcon,
    Assignment as AssignmentIcon,
    Group as GroupIcon,
    Folder as FolderIcon,
    Flag as FlagIcon,
    DonutLarge as DonutLargeIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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

const Dashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
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

    // Mock data for development if API doesn't return data
    const mockData = {
        totalTeams: 5,
        totalProjects: 12,
        totalTasks: 48,
        userAssignedTasks: 18,
        tasksByStatus: {
            todo: 15,
            inProgress: 20,
            review: 5,
            completed: 8
        },
        userTasksByStatus: {
            todo: 5,
            inProgress: 8,
            review: 2,
            completed: 3
        },
        tasksByPriority: {
            low: 10,
            medium: 25,
            high: 13
        },
        projectsByStatus: {
            planned: 3,
            inProgress: 5,
            onHold: 2,
            completed: 2
        },
        upcomingTasks: [
            { _id: '1', title: 'Dokończyć dokumentację projektu X', dueDate: '2023-06-10', priority: 'high', project: { name: 'Projekt X' } },
            { _id: '2', title: 'Przygotować prototyp interfejsu', dueDate: '2023-06-12', priority: 'medium', project: { name: 'Projekt Y' } },
            { _id: '3', title: 'Testowanie API platformy', dueDate: '2023-06-15', priority: 'low', project: { name: 'Projekt Z' } }
        ],
        recentlyCompletedTasks: [
            { _id: '4', title: 'Przygotowanie planu projektu', completedAt: '2023-06-01', project: { name: 'Projekt A' } },
            { _id: '5', title: 'Implementacja logowania', completedAt: '2023-06-02', project: { name: 'Projekt B' } }
        ]
    };

    // Use mock data if API fails or for development
    const dashboardData = stats || mockData;

    // Transform data for charts
    const taskStatusData = [
        { name: 'Do zrobienia', value: dashboardData.tasksByStatus.todo, color: '#FF9800' },
        { name: 'W trakcie', value: dashboardData.tasksByStatus.inProgress, color: '#2196F3' },
        { name: 'W przeglądzie', value: dashboardData.tasksByStatus.review, color: '#9C27B0' },
        { name: 'Ukończone', value: dashboardData.tasksByStatus.completed, color: '#4CAF50' }
    ];

    const projectStatusData = [
        { name: 'Planowane', value: dashboardData.projectsByStatus.planned },
        { name: 'W trakcie', value: dashboardData.projectsByStatus.inProgress },
        { name: 'Wstrzymane', value: dashboardData.projectsByStatus.onHold },
        { name: 'Ukończone', value: dashboardData.projectsByStatus.completed }
    ];

    const priorityData = [
        { name: 'Niski', value: dashboardData.tasksByPriority.low, color: '#8BC34A' },
        { name: 'Średni', value: dashboardData.tasksByPriority.medium, color: '#FF9800' },
        { name: 'Wysoki', value: dashboardData.tasksByPriority.high, color: '#F44336' }
    ];

    // Calculate completion percentage
    const totalTasksCompleted = dashboardData.tasksByStatus.completed;
    const totalTasksCount = Object.values(dashboardData.tasksByStatus).reduce((a, b) => a + b, 0);
    const completionPercentage = totalTasksCount > 0
        ? Math.round((totalTasksCompleted / totalTasksCount) * 100)
        : 0;

    // Format date string
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pl-PL', options);
    };

    // Priority color map
    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return theme.palette.error.main;
            case 'medium': return theme.palette.warning.main;
            case 'low': return theme.palette.success.main;
            default: return theme.palette.info.main;
        }
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                    Ładowanie danych...
                </Typography>
            </Box>
        );
    }

    if (error && !dashboardData) {
        return (
            <Alert severity="error" sx={{ mb: 4 }}>
                <AlertTitle>Błąd</AlertTitle>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            {/* Welcome message and date */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    {`Witaj, ${user?.name || 'Użytkowniku'}!`}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {new Date().toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </Typography>
            </Box>

            {/* Quick stats cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: '100%',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h5" fontWeight="bold" color="text.primary">
                                    {dashboardData.userAssignedTasks}
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                                    <AssignmentIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Twoje zadania
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {dashboardData.userTasksByStatus.completed} ukończonych
                            </Typography>
                            <Box sx={{ mt: 'auto' }}>
                                <Button
                                    variant="text"
                                    color="primary"
                                    endIcon={<ArrowForwardIcon />}
                                    component={Link}
                                    to="/tasks"
                                    sx={{ textTransform: 'none', fontWeight: 'medium' }}
                                >
                                    Zobacz wszystkie
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: '100%',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h5" fontWeight="bold" color="text.primary">
                                    {dashboardData.totalProjects}
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                                    <FolderIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Projekty
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {dashboardData.projectsByStatus.inProgress} w trakcie
                            </Typography>
                            <Box sx={{ mt: 'auto' }}>
                                <Button
                                    variant="text"
                                    color="info"
                                    endIcon={<ArrowForwardIcon />}
                                    component={Link}
                                    to="/projects"
                                    sx={{ textTransform: 'none', fontWeight: 'medium' }}
                                >
                                    Zobacz wszystkie
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: '100%',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h5" fontWeight="bold" color="text.primary">
                                    {dashboardData.totalTeams}
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                                    <GroupIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Zespoły
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Łącznie
                            </Typography>
                            <Box sx={{ mt: 'auto' }}>
                                <Button
                                    variant="text"
                                    color="success"
                                    endIcon={<ArrowForwardIcon />}
                                    component={Link}
                                    to="/teams"
                                    sx={{ textTransform: 'none', fontWeight: 'medium' }}
                                >
                                    Zobacz wszystkie
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            height: '100%',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h5" fontWeight="bold" color="text.primary">
                                    {completionPercentage}%
                                </Typography>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                                    <DonutLargeIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Postęp zadań
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {dashboardData.tasksByStatus.completed} z {totalTasksCount} ukończonych
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={completionPercentage}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: theme.palette.warning.main,
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Task status chart */}
                <Grid item xs={12} md={6}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            height: '100%'
                        }}
                    >
                        <CardHeader
                            title="Status zadań"
                            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                        />
                        <Divider />
                        <CardContent sx={{ height: 300 }}>
                            {taskStatusData.some(item => item.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={taskStatusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {taskStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Legend verticalAlign="bottom" height={36} />
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <Typography variant="body1" color="text.secondary">
                                        Brak danych do wyświetlenia
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Project status chart */}
                <Grid item xs={12} md={6}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            height: '100%'
                        }}
                    >
                        <CardHeader
                            title="Status projektów"
                            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                        />
                        <Divider />
                        <CardContent sx={{ height: 300 }}>
                            {projectStatusData.some(item => item.value > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
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
                                        <RechartsTooltip />
                                        <Bar dataKey="value" name="Ilość" fill={theme.palette.primary.main} barSize={30} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <Typography variant="body1" color="text.secondary">
                                        Brak danych do wyświetlenia
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Upcoming tasks */}
                <Grid item xs={12} md={6}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            height: '100%'
                        }}
                    >
                        <CardHeader
                            title="Nadchodzące zadania"
                            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                            action={
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate('/tasks/new')}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Dodaj
                                </Button>
                            }
                        />
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                            {dashboardData.upcomingTasks && dashboardData.upcomingTasks.length > 0 ? (
                                <List sx={{ width: '100%' }}>
                                    {dashboardData.upcomingTasks.map((task) => (
                                        <React.Fragment key={task._id}>
                                            <ListItem
                                                alignItems="flex-start"
                                                secondaryAction={
                                                    <Chip
                                                        size="small"
                                                        label={task.priority === 'high' ? 'Wysoki' : task.priority === 'medium' ? 'Średni' : 'Niski'}
                                                        sx={{
                                                            bgcolor: alpha(getPriorityColor(task.priority), 0.1),
                                                            color: getPriorityColor(task.priority),
                                                            fontWeight: 'medium'
                                                        }}
                                                    />
                                                }
                                                sx={{ px: 2, py: 1.5 }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box component={Link} to={`/tasks/${task._id}`} sx={{
                                                            color: 'text.primary',
                                                            textDecoration: 'none',
                                                            '&:hover': { textDecoration: 'underline' },
                                                            fontWeight: 'medium',
                                                            display: 'block',
                                                            mb: 0.5
                                                        }}>
                                                            {task.title}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {formatDate(task.dueDate)}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {task.project?.name}
                                                            </Typography>
                                                        </Stack>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                                    <Typography variant="body1" color="text.secondary">
                                        Brak nadchodzących zadań
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recently completed tasks */}
                <Grid item xs={12} md={6}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            height: '100%'
                        }}
                    >
                        <CardHeader
                            title="Ostatnio ukończone zadania"
                            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                        />
                        <Divider />
                        <CardContent sx={{ p: 0 }}>
                            {dashboardData.recentlyCompletedTasks && dashboardData.recentlyCompletedTasks.length > 0 ? (
                                <List sx={{ width: '100%' }}>
                                    {dashboardData.recentlyCompletedTasks.map((task) => (
                                        <React.Fragment key={task._id}>
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{ px: 2, py: 1.5 }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                                                            <Box component={Link} to={`/tasks/${task._id}`} sx={{
                                                                color: 'text.primary',
                                                                textDecoration: 'none',
                                                                '&:hover': { textDecoration: 'underline' },
                                                                fontWeight: 'medium'
                                                            }}>
                                                                {task.title}
                                                            </Box>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 4, mt: 0.5 }}>
                                                            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {formatDate(task.completedAt)}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {task.project?.name}
                                                            </Typography>
                                                        </Stack>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                                    <Typography variant="body1" color="text.secondary">
                                        Brak ukończonych zadań
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;

