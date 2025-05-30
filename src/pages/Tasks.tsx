// src/pages/Tasks.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import api from '../api/axios';

// Typy
interface Task {
    _id: string;
    title: string;
    description: string;
    project: { _id: string; name: string };
    assignedTo?: { _id: string; name: string; email: string };
    createdBy: { _id: string; name: string; email: string };
    dueDate?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    createdAt: string;
}

interface Project {
    _id: string;
    name: string;
}

const Tasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        project: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Pobierz projekty
                const projectsResponse = await api.get('/projects');
                setProjects(projectsResponse.data);

                // Pobierz zadania (ewentualnie filtrowane po projekcie)
                const tasksResponse = await api.get('/tasks', {
                    params: { projectId: selectedProject || undefined }
                });
                setTasks(tasksResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Wystąpił błąd podczas ładowania danych');
                setLoading(false);
            }
        };

        fetchTasks();
    }, [selectedProject]);

    const handleProjectChange = (event) => {
        setSelectedProject(event.target.value);
    };

    const handleOpenDialog = () => {
        if (projects.length === 0) {
            setError('Musisz najpierw utworzyć projekt, aby dodać zadanie');
            return;
        }
        setNewTask({ ...newTask, project: projects[0]._id });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewTask({
            title: '',
            description: '',
            project: '',
            dueDate: '',
            priority: 'medium',
            status: 'todo',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({ ...newTask, [name]: value });
    };

    const handleCreateTask = async () => {
        try {
            const response = await api.post('/tasks', newTask);
            setTasks([...tasks, response.data]);
            handleCloseDialog();
        } catch (err) {
            console.error('Error creating task:', err);
            setError('Wystąpił błąd podczas tworzenia zadania');
        }
    };

    const handleViewTask = (task) => {
        navigate(`/tasks/${task._id}`);
    };

    const handleDragStart = (e, task) => {
        e.dataTransfer.setData('taskId', task._id);
        e.dataTransfer.setData('status', task.status);
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const oldStatus = e.dataTransfer.getData('status');

        if (oldStatus === newStatus) return;

        try {
            const response = await api.put(`/tasks/${taskId}`, { status: newStatus });

            // Aktualizuj lokalny stan
            const updatedTasks = tasks.map(task =>
                task._id === taskId ? response.data : task
            );
            setTasks(updatedTasks);
        } catch (err) {
            console.error('Error updating task status:', err);
            setError('Wystąpił błąd podczas aktualizacji statusu zadania');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    // Grupowanie zadań według statusu
    const todoTasks = tasks.filter(task => task.status === 'todo');
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
    const reviewTasks = tasks.filter(task => task.status === 'review');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Zadania</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                        <InputLabel id="project-select-label">Projekt</InputLabel>
                        <Select
                            labelId="project-select-label"
                            id="project-select"
                            value={selectedProject}
                            onChange={handleProjectChange}
                            label="Projekt"
                        >
                            <MenuItem value="">Wszystkie projekty</MenuItem>
                            {projects.map((project) => (
                                <MenuItem key={project._id} value={project._id}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                    >
                        Nowe zadanie
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Kolumna: Do zrobienia */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={2}
                        sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}
                        onDrop={(e) => handleDrop(e, 'todo')}
                        onDragOver={handleDragOver}
                    >
                        <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #ddd' }}>
                            Do zrobienia ({todoTasks.length})
                        </Typography>
                        {todoTasks.map((task) => (
                            <Card
                                key={task._id}
                                sx={{ mb: 2, cursor: 'grab' }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                            >
                                <CardHeader
                                    title={task.title}
                                    action={
                                        <IconButton aria-label="settings" onClick={() => handleViewTask(task)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                                        {task.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Chip
                                            label={task.priority}
                                            color={getPriorityColor(task.priority)}
                                            size="small"
                                        />
                                        {task.dueDate && (
                                            <Typography variant="caption">
                                                Termin: {new Date(task.dueDate).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        {task.assignedTo ? `Przypisane do: ${task.assignedTo.name}` : 'Nieprzypisane'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Grid>

                {/* Kolumna: W trakcie */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={2}
                        sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}
                        onDrop={(e) => handleDrop(e, 'in-progress')}
                        onDragOver={handleDragOver}
                    >
                        <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #ddd' }}>
                            W trakcie ({inProgressTasks.length})
                        </Typography>
                        {inProgressTasks.map((task) => (
                            <Card
                                key={task._id}
                                sx={{ mb: 2, cursor: 'grab' }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                            >
                                <CardHeader
                                    title={task.title}
                                    action={
                                        <IconButton aria-label="settings" onClick={() => handleViewTask(task)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                                        {task.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Chip
                                            label={task.priority}
                                            color={getPriorityColor(task.priority)}
                                            size="small"
                                        />
                                        {task.dueDate && (
                                            <Typography variant="caption">
                                                Termin: {new Date(task.dueDate).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        {task.assignedTo ? `Przypisane do: ${task.assignedTo.name}` : 'Nieprzypisane'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Grid>

                {/* Kolumna: Przegląd */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={2}
                        sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}
                        onDrop={(e) => handleDrop(e, 'review')}
                        onDragOver={handleDragOver}
                    >
                        <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #ddd' }}>
                            Przegląd ({reviewTasks.length})
                        </Typography>
                        {reviewTasks.map((task) => (
                            <Card
                                key={task._id}
                                sx={{ mb: 2, cursor: 'grab' }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                            >
                                <CardHeader
                                    title={task.title}
                                    action={
                                        <IconButton aria-label="settings" onClick={() => handleViewTask(task)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                                        {task.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Chip
                                            label={task.priority}
                                            color={getPriorityColor(task.priority)}
                                            size="small"
                                        />
                                        {task.dueDate && (
                                            <Typography variant="caption">
                                                Termin: {new Date(task.dueDate).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        {task.assignedTo ? `Przypisane do: ${task.assignedTo.name}` : 'Nieprzypisane'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Grid>

                {/* Kolumna: Zakończone */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={2}
                        sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}
                        onDrop={(e) => handleDrop(e, 'completed')}
                        onDragOver={handleDragOver}
                    >
                        <Typography variant="h6" sx={{ mb: 2, pb: 1, borderBottom: '1px solid #ddd' }}>
                            Zakończone ({completedTasks.length})
                        </Typography>
                        {completedTasks.map((task) => (
                            <Card
                                key={task._id}
                                sx={{ mb: 2, cursor: 'grab' }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                            >
                                <CardHeader
                                    title={task.title}
                                    action={
                                        <IconButton aria-label="settings" onClick={() => handleViewTask(task)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    }
                                />
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                                        {task.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Chip
                                            label={task.priority}
                                            color={getPriorityColor(task.priority)}
                                            size="small"
                                        />
                                        {task.dueDate && (
                                            <Typography variant="caption">
                                                Termin: {new Date(task.dueDate).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        {task.assignedTo ? `Przypisane do: ${task.assignedTo.name}` : 'Nieprzypisane'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialog tworzenia nowego zadania */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Nowe zadanie</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="title"
                        name="title"
                        label="Tytuł zadania"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newTask.title}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        name="description"
                        label="Opis zadania"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        value={newTask.description}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="project-label">Projekt</InputLabel>
                        <Select
                            labelId="project-label"
                            id="project"
                            name="project"
                            value={newTask.project}
                            label="Projekt"
                            onChange={handleInputChange}
                        >
                            {projects.map((project) => (
                                <MenuItem key={project._id} value={project._id}>
                                    {project.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="dueDate"
                        name="dueDate"
                        label="Termin"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={newTask.dueDate}
                        onChange={handleInputChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="priority-label">Priorytet</InputLabel>
                        <Select
                            labelId="priority-label"
                            id="priority"
                            name="priority"
                            value={newTask.priority}
                            label="Priorytet"
                            onChange={handleInputChange}
                        >
                            <MenuItem value="low">Niski</MenuItem>
                            <MenuItem value="medium">Średni</MenuItem>
                            <MenuItem value="high">Wysoki</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anuluj</Button>
                    <Button
                        onClick={handleCreateTask}
                        variant="contained"
                        disabled={!newTask.title.trim() || !newTask.project}
                    >
                        Utwórz
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Tasks;