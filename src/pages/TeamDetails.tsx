// src/pages/TeamDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Chip,
    Grid,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Email as EmailIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [team, setTeam] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editedTeam, setEditedTeam] = useState({ name: '', description: '' });
    const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                const teamResponse = await api.get(`/teams/${id}`);
                setTeam(teamResponse.data);
                setEditedTeam({
                    name: teamResponse.data.name,
                    description: teamResponse.data.description,
                });

                // Pobierz projekty zespołu
                const projectsResponse = await api.get('/projects', { params: { teamId: id } });
                setProjects(projectsResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching team details:', err);
                setError('Nie udało się pobrać szczegółów zespołu');
                setLoading(false);
            }
        };

        fetchTeamDetails();
    }, [id]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditedTeam({
            name: team.name,
            description: team.description,
        });
    };

    const handleSaveEdit = async () => {
        try {
            const response = await api.put(`/teams/${id}`, editedTeam);
            setTeam(response.data);
            setEditMode(false);
        } catch (err) {
            console.error('Error updating team:', err);
            setError('Nie udało się zaktualizować zespołu');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedTeam({ ...editedTeam, [name]: value });
    };

    const handleAddMemberOpen = () => {
        setOpenAddMemberDialog(true);
    };

    const handleAddMemberClose = () => {
        setOpenAddMemberDialog(false);
        setNewMemberEmail('');
    };

    const handleAddMember = async () => {
        try {
            const response = await api.post(`/teams/${id}/members`, { email: newMemberEmail });
            setTeam(response.data);
            handleAddMemberClose();
        } catch (err) {
            console.error('Error adding member:', err);
            setError('Nie udało się dodać członka zespołu');
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            const response = await api.delete(`/teams/${id}/members/${memberId}`);
            setTeam(response.data);
        } catch (err) {
            console.error('Error removing member:', err);
            setError('Nie udało się usunąć członka zespołu');
        }
    };

    const handleDeleteClick = () => {
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/teams/${id}`);
            navigate('/teams');
        } catch (err) {
            console.error('Error deleting team:', err);
            setError('Nie udało się usunąć zespołu');
        }
        setOpenDeleteDialog(false);
    };

    const handleNewProjectOpen = () => {
        setOpenNewProjectDialog(true);
    };

    const handleNewProjectClose = () => {
        setOpenNewProjectDialog(false);
        setNewProject({ name: '', description: '' });
    };

    const handleNewProjectChange = (e) => {
        const { name, value } = e.target;
        setNewProject({ ...newProject, [name]: value });
    };

    const handleCreateProject = async () => {
        try {
            const response = await api.post('/projects', {
                ...newProject,
                team: id,
            });
            setProjects([...projects, response.data]);
            handleNewProjectClose();
        } catch (err) {
            console.error('Error creating project:', err);
            setError('Nie udało się utworzyć projektu');
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

    if (!team) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Nie znaleziono zespołu.
            </Alert>
        );
    }

    const isTeamLeader = team.leader._id === user?._id;

    return (
        <Box>
            <Button
                variant="text"
                sx={{ mb: 2 }}
                onClick={() => navigate('/teams')}
            >
                &lt; Powrót do zespołów
            </Button>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {!editMode ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h4">{team.name}</Typography>
                            {isTeamLeader && (
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
                            {team.description}
                        </Typography>

                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Lider zespołu:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar sx={{ mr: 2 }}>{team.leader.name.charAt(0)}</Avatar>
                            <Box>
                                <Typography variant="body1">{team.leader.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{team.leader.email}</Typography>
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Box component="form">
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Edytuj zespół
                        </Typography>

                        <TextField
                            label="Nazwa zespołu"
                            name="name"
                            value={editedTeam.name}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />

                        <TextField
                            label="Opis zespołu"
                            name="description"
                            value={editedTeam.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={4}
                            margin="normal"
                        />

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

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">Członkowie zespołu</Typography>
                    {isTeamLeader && (
                        <Button
                            variant="outlined"
                            startIcon={<PersonAddIcon />}
                            onClick={handleAddMemberOpen}
                        >
                            Dodaj członka
                        </Button>
                    )}
                </Box>

                <List>
                    {team.members.map((member) => (
                        <ListItem
                            key={member._id}
                            secondaryAction={
                                isTeamLeader && member._id !== team.leader._id && (
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleRemoveMember(member._id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )
                            }
                        >
                            <ListItemAvatar>
                                <Avatar>{member.name.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={member.name}
                                secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        {member.email}
                                        {member._id === team.leader._id && (
                                            <Chip
                                                label="Lider"
                                                color="primary"
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">Projekty zespołu</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleNewProjectOpen}
                    >
                        Nowy projekt
                    </Button>
                </Box>

                {projects.length > 0 ? (
                    <Grid container spacing={3}>
                        {projects.map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project._id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {project.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {project.description}
                                        </Typography>
                                        <Chip
                                            label={project.status}
                                            color={
                                                project.status === 'completed' ? 'success' :
                                                    project.status === 'in-progress' ? 'primary' :
                                                        project.status === 'on-hold' ? 'warning' : 'default'
                                            }
                                            size="small"
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            component={Link}
                                            to={`/projects/${project._id}`}
                                        >
                                            Szczegóły
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        Ten zespół nie ma jeszcze żadnych projektów.
                    </Alert>
                )}
            </Paper>

            {/* Dialog dodawania członka */}
            <Dialog open={openAddMemberDialog} onClose={handleAddMemberClose}>
                <DialogTitle>Dodaj nowego członka</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Adres email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddMemberClose}>Anuluj</Button>
                    <Button onClick={handleAddMember} variant="contained">
                        Dodaj
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog usuwania zespołu */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>
                    Czy na pewno chcesz usunąć ten zespół?
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Ta operacja jest nieodwracalna i spowoduje usunięcie zespołu oraz wszystkich powiązanych projektów i zadań.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Anuluj</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Usuń
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog tworzenia projektu */}
            <Dialog open={openNewProjectDialog} onClose={handleNewProjectClose} maxWidth="sm" fullWidth>
                <DialogTitle>Nowy projekt</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Nazwa projektu"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newProject.name}
                        onChange={handleNewProjectChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        name="description"
                        label="Opis projektu"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        value={newProject.description}
                        onChange={handleNewProjectChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleNewProjectClose}>Anuluj</Button>
                    <Button
                        onClick={handleCreateProject}
                        variant="contained"
                        disabled={!newProject.name.trim()}
                    >
                        Utwórz
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeamDetails;