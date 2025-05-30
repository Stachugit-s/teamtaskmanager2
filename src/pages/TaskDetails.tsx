// src/pages/TaskDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Button,
    Divider,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    Flag as FlagIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TaskDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedTask, setEditedTask] = useState({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: '',
        status: '',
    });
    const [teamMembers, setTeamMembers] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const taskResponse = await api.get(`/tasks/${id}`);
                setTask(taskResponse.data);

                // Pobierz członków zespołu projektu do przypisania zadania
                if (taskResponse.data.project && taskResponse.data.project._id) {
                    const projectResponse = await api.get(`/projects/${taskResponse.data.project._id}`);
                    if (projectResponse.data.team && projectResponse.data.team._id) {
                        const teamResponse = await api.get(`/teams/${projectResponse.data.team._id}`);
                        setTeamMembers(teamResponse.data.members);
                    }
                }

                // Pobierz komentarze zadania
                const commentsResponse = await api.get(`/comments/task/${id}`);
                setComments(commentsResponse.data);

                setEditedTask({
                    title: taskResponse.data.title,
                    description: taskResponse.data.description,
                    assignedTo: taskResponse.data.assignedTo ? taskResponse.data.assignedTo._id : '',
                    dueDate: taskResponse.data.dueDate ? taskResponse.data.dueDate.split('T')[0] : '',
                    priority: taskResponse.data.priority,
                    status: taskResponse.data.status,
                });

                setLoading(false);
            } catch (err) {
                console.error('Error fetching task details:', err);
                setError('Nie udało się załadować szczegółów zadania');
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const response = await api.post('/comments', {
                text: commentText,
                taskId: id,
            });
            setComments([response.data, ...comments]);
            setCommentText('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Nie udało się dodać komentarza');
        }
    };

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditedTask({
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo ? task.assignedTo._id : '',
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            priority: task.priority,
            status: task.status,
        });
    };

    const handleSaveEdit = async () => {
        try {
            const response = await api.put(`/tasks/${id}`, editedTask);
            setTask(response.data);
            setEditMode(false);
        } catch (err) {
            console.error('Error updating task:', err);
            setError('Nie udało się zaktualizować zadania');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedTask({ ...editedTask, [name]: value });
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/tasks/${id}`);
            navigate('/tasks');
        } catch (err) {
            console.error('Error deleting task:', err);
            setError('Nie udało się usunąć zadania');
        }
        setDeleteDialogOpen(false);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
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

    const getStatusLabel = (status) => {
        switch (status) {
            case 'todo':
                return 'Do zrobienia';
            case 'in-progress':
                return 'W trakcie';
            case 'review':
                return 'Przegląd';
            case 'completed':
                return 'Zakończone';
            default:
                return status;
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

    if (!task) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Nie znaleziono zadania.
            </Alert>
        );
    }

    return (
        <Box>
            <Button
                variant="text"
                sx={{ mb: 2 }}
                onClick={() => navigate('/tasks')}
            >
                &lt; Powrót do zadań
            </Button>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {!editMode ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h4">{task.title}</Typography>
                            <Box>
                                <IconButton color="primary" onClick={handleEditClick} sx={{ mr: 1 }}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={handleDeleteClick}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        <Typography variant="body1" sx={{ mb: 3 }}>
                            {task.description}
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PersonIcon sx={{ mr: 1 }} color="action" />
                                    <Typography variant="body2">
                                        Przypisane do: {task.assignedTo ? task.assignedTo.name : 'Nieprzypisane'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CalendarIcon sx={{ mr: 1 }} color="action" />
                                    <Typography variant="body2">
                                        Termin: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Brak terminu'}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <FlagIcon sx={{ mr: 1 }} color="action" />
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                        Priorytet:
                                    </Typography>
                                    <Chip
                                        label={task.priority}
                                        color={getPriorityColor(task.priority)}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                        Status:
                                    </Typography>
                                    <Chip
                                        label={getStatusLabel(task.status)}
                                        color={task.status === 'completed' ? 'success' : 'primary'}
                                        size="small"
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Projekt: {task.project.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Utworzone przez: {task.createdBy.name} ({new Date(task.createdAt).toLocaleDateString()})
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <Box component="form">
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Edytuj zadanie
                        </Typography>

                        <TextField
                            label="Tytuł"
                            name="title"
                            value={editedTask.title}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />

                        <TextField
                            label="Opis"
                            name="description"
                            value={editedTask.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="assigned-to-label">Przypisane do</InputLabel>
                                    <Select
                                        labelId="assigned-to-label"
                                        name="assignedTo"
                                        value={editedTask.assignedTo}
                                        onChange={handleInputChange}
                                        label="Przypisane do"
                                    >
                                        <MenuItem value="">
                                            <em>Brak</em>
                                        </MenuItem>
                                        {teamMembers.map((member) => (
                                            <MenuItem key={member._id} value={member._id}>
                                                {member.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Termin"
                                    name="dueDate"
                                    type="date"
                                    value={editedTask.dueDate}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="priority-label">Priorytet</InputLabel>
                                    <Select
                                        labelId="priority-label"
                                        name="priority"
                                        value={editedTask.priority}
                                        onChange={handleInputChange}
                                        label="Priorytet"
                                    >
                                        <MenuItem value="low">Niski</MenuItem>
                                        <MenuItem value="medium">Średni</MenuItem>
                                        <MenuItem value="high">Wysoki</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="status-label">Status</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        name="status"
                                        value={editedTask.status}
                                        onChange={handleInputChange}
                                        label="Status"
                                    >
                                        <MenuItem value="todo">Do zrobienia</MenuItem>
                                        <MenuItem value="in-progress">W trakcie</MenuItem>
                                        <MenuItem value="review">Przegląd</MenuItem>
                                        <MenuItem value="completed">Zakończone</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

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
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Komentarze
                </Typography>

                <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Dodaj komentarz"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        variant="outlined"
                        size="small"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        endIcon={<SendIcon />}
                        disabled={!commentText.trim()}
                        sx={{ ml: 1 }}
                    >
                        Wyślij
                    </Button>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <List>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <ListItem key={comment._id} alignItems="flex-start" sx={{ px: 0 }}>
                                <ListItemAvatar>
                                    <Avatar>
                                        {comment.user.name.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle2">
                                                {comment.user.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                            sx={{ display: 'block', mt: 1 }}
                                        >
                                            {comment.text}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            Brak komentarzy. Bądź pierwszy i dodaj komentarz!
                        </Typography>
                    )}
                </List>
            </Paper>

            {/* Dialog potwierdzenia usunięcia */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>
                    Czy na pewno chcesz usunąć to zadanie?
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Ta operacja jest nieodwracalna i spowoduje usunięcie zadania oraz wszystkich powiązanych komentarzy.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Anuluj</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Usuń
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TaskDetails;