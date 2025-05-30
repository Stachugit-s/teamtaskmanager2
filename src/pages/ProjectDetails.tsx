// src/pages/ProjectDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    CircularProgress,
    Alert,
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
    Card,
    CardContent,
    CardActions,
    Divider,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedProject, setEditedProject] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: '',
    });
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
    });
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const projectResponse = await api.get(`/projects/${id}`);
                setProject(projectResponse.data);
                setEditedProject({
                    name: projectResponse.data.name,
                    description: projectResponse.data.description,
                    startDate: projectResponse.data.startDate ? projectResponse.data.startDate.split('T')[0] : '',
                    endDate: projectResponse.data.endDate ? projectResponse.data.endDate.split('T')[0] : '',
                    status: projectResponse.data.status,
                });

                // Pobierz zadania projektu
                const tasksResponse = await api.get('/tasks', { params: { projectId: id } });
                setTasks(tasksResponse.data);

                // Pobierz członków zespołu projektu
                if (projectResponse.data.team && projectResponse.data.team._id) {
                    const teamResponse = await api.get(`/teams/${projectResponse.data.team._id}`);
                    setTeamMembers(teamResponse.data.members);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching project details:', err);
                setError('Nie udało się pobrać szczegółów projektu');
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditedProject({
            name: project.name,
            description: project.description,
            startDate: project.startDate ? project.startDate.split('T')[0] : '',
            endDate: project.endDate ? project.endDate.split('T')[0] : '',
            status: project.status,
        });
    };

    const handleSaveEdit = async () => {
        try {
            const response = await api.put(`/projects/${id}`, editedProject);
            setProject(response.data);
            setEditMode(false);
        } catch (err) {
            console.error('Error updating project:', err);
            setError('Nie udało się zaktualizować projektu');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProject({ ...editedProject, [name]: value });
    };

    const handleDeleteClick = () => {
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/projects/${id}`);
            navigate('/projects');
        } catch (err) {
            console.error('Error deleting project:', err);
            setError('Nie udało się usunąć projektu');
        }
        setOpenDeleteDialog(false);
    };

    const handleNewTaskOpen = () => {
        setOpenNewTaskDialog(true);
    };

    const handleNewTaskClose = () => {
        setOpenNewTaskDialog(false);
        setNewTask({
            title: '',
            description: '',
            assignedTo: '',
            dueDate: '',
            priority: 'medium',
            status: 'todo',
        });
    };

    const handleNewTaskChange = (e) => {
        const { name, value } = e.target;
        setNewTask({ ...newTask, [name]: value });
    };

    const handleCreateTask = async () => {
        try {
            const response = await api.post('/tasks', {
                ...newTask,
                project: id,
            });
            setTasks([...tasks, response.data]);
            handleNewTaskClose();
        } catch (err) {
            console.error('Error creating task:', err);
            setError('Nie udało się utworzyć zadania');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'planned':
                return 'info';
            case 'in-progress':
                return 'primary';
            case 'on-hold':
                return 'warning';
            case 'completed':
                return 'success';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'planned':
                return 'Planowany';
            case 'in-progress':
                return 'W trakcie';
            case 'on-hold':
                return 'Wstrzymany';
            case 'completed':
                return 'Zakończony';
            default:
                return status;
        }
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!project) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Nie znaleziono projektu.
            </Alert>
        );
    }

    const isTeamLeader = project.team && project.team.leader && project.team.leader._id === user?._id;
    const isProjectCreator = project.createdBy && project.createdBy._id === user?._id;
    const canEdit = isTeamLeader || isProjectCreator || user?.role === 'admin';

    // Grupowanie zadań według statusu
    const todoTasks = tasks.filter(task => task.status === 'todo');
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
    const reviewTasks = tasks.filter(task => task.status === 'review');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    return (
        <Box>
            <Button
                variant="text"
                sx={{ mb: 2 }}
                onClick={() => navigate('/projects')}
            >
                &lt; Powrót do projektów
            </Button>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {!editMode ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h4">{project.name}</Typography>
                            {canEdit && (
                                <Box>
                                    <IconButton color="primary" onClick={handleEditClick} sx={{ mr: 1 }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={handleDeleteClick}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        <Typography variant="body1" sx={{ mb: 3 }}>
                            {project.description}
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Zespół:</strong> {project.team ? project.team.name : 'Brak zespołu'}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Utworzony przez:</strong> {project.createdBy ? project.createdBy.name : 'Nieznany'}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Data utworzenia:</strong> {new Date(project.createdAt).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Data rozpoczęcia:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Nie określono'}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Planowana data zakończenia:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Nie określono'}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                        <strong>Status:</strong>
                                    </Typography>
                                    <Chip
                                        label={getStatusLabel(project.status)}
                                        color={getStatusColor(project.status)}
                                        size="small"
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <Box component="form">
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Edytuj projekt
                        </Typography>

                        <TextField
                            label="Nazwa projektu"
                            name="name"
                            value={editedProject.name}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />

                        <TextField
                            label="Opis projektu"
                            name="description"
                            value={editedProject.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Data rozpoczęcia"
                                    name="startDate"
                                    type="date"
                                    value={editedProject.startDate}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Planowana data zakończenia"
                                    name="endDate"
                                    type="date"
                                    value={editedProject.endDate}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                name="status"
                                value={editedProject.status}
                                onChange={handleInputChange}
                                label="Status"
                            >
                                <MenuItem value="planned">Planowany</MenuItem>
                                <MenuItem value="in-progress">W trakcie</MenuItem>
                                <MenuItem value="on-hold">Wstrzymany</MenuItem>
                                <MenuItem value="completed">Zakończony</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={handleCancelEdit} sx={{ mr: 1 }}>
                                Anuluj
                            </Button>
                            <Button variant="contained" onClick={handleSaveEdit}>
                                Zapisz
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">Zadania</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleNewTaskOpen}
                    >
                        Nowe zadanie
                    </Button>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Podsumowanie zadań
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Paper elevation={1} sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                                <Typography variant="h6" align="center">{todoTasks.length}</Typography>
                                <Typography variant="body2" align="center">Do zrobienia</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Paper elevation={1} sx={{ p: 2, bgcolor: '#fff8e1' }}>
                                <Typography variant="h6" align="center">{inProgressTasks.length}</Typography>
                                <Typography variant="body2" align="center">W trakcie</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Paper elevation={1} sx={{ p: 2, bgcolor: '#fce4ec' }}>
                                <Typography variant="h6" align="center">{reviewTasks.length}</Typography>
                                <Typography variant="body2" align="center">Przegląd</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Paper elevation={1} sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                                <Typography variant="h6" align="center">{completedTasks.length}</Typography>
                                <Typography variant="body2" align="center">Zakończone</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="subtitle1" gutterBottom>
                    Lista zadań
                </Typography>

                {tasks.length > 0 ? (
                    <Grid container spacing={2}>
                        {tasks.map((task) => (
                            <Grid item xs={12} sm={6} md={4} key={task._id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {task.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {task.description.length > 100
                                                ? `${task.description.substring(0, 100)}...`
                                                : task.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Chip
                                                label={task.status}
                                                color={
                                                    task.status === 'completed' ? 'success' :
                                                        task.status === 'in-progress' ? 'primary' :
                                                            task.status === 'review' ? 'secondary' : 'default'
                                                }
                                                size="small"
                                            />
                                            <Chip
                                                label={task.priority}
                                                color={getPriorityColor(task.priority)}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="caption" display="block">
                                            {task.assignedTo
                                                ? `Przypisane do: ${task.assignedTo.name}`
                                                : 'Nieprzypisane'}
                                        </Typography>
                                        {task.dueDate && (
                                            <Typography variant="caption" display="block">
                                                Termin: {new Date(task.dueDate).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            component={Link}
                                            to={`/tasks/${task._id}`}
                                        >
                                            Szczegóły
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Alert severity="info">
                        Ten projekt nie ma jeszcze żadnych zadań.
                    </Alert>
                )}
            </Paper>

            {/* Dialog usuwania projektu */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>
                    Czy na pewno chcesz usunąć ten projekt?
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Ta operacja jest nieodwracalna i spowoduje usunięcie projektu oraz wszystkich powiązanych zadań.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Anuluj</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Usuń
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog tworzenia zadania */}
            <Dialog open={openNewTaskDialog} onClose={handleNewTaskClose} maxWidth="sm" fullWidth>
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
                        onChange={handleNewTaskChange}
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
                        onChange={handleNewTaskChange}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="assigned-to-label">Przypisane do</InputLabel>
                        <Select
                            labelId="assigned-to-label"
                            id="assignedTo"
                            name="assignedTo"
                            value={newTask.assignedTo}
                            onChange={handleNewTaskChange}
                            label="Przypisane do"
                        >
                            <MenuItem value="">
                                <em>Nieprzypisane</em>
                            </MenuItem>
                            {teamMembers.map((member) => (
                                <MenuItem key={member._id} value={member._id}>
                                    {member.name}
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
                        onChange={handleNewTaskChange}
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
                            onChange={handleNewTaskChange}
                            label="Priorytet"
                        >
                            <MenuItem value="low">Niski</MenuItem>
                            <MenuItem value="medium">Średni</MenuItem>
                            <MenuItem value="high">Wysoki</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status"
                            name="status"
                            value={newTask.status}
                            onChange={handleNewTaskChange}
                            label="Status"
                        >
                            <MenuItem value="todo">Do zrobienia</MenuItem>
                            <MenuItem value="in-progress">W trakcie</MenuItem>
                            <MenuItem value="review">Przegląd</MenuItem>
                            <MenuItem value="completed">Zakończone</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleNewTaskClose}>Anuluj</Button>
                    <Button
                        onClick={handleCreateTask}
                        variant="contained"
                        disabled={!newTask.title.trim()}
                    >
                        Utwórz
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjectDetails;