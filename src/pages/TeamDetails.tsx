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

// Definicje typów
interface TeamMember {
    _id: string;
    name: string;
    lastName: string;
    email: string;
}

interface Team {
    _id: string;
    name: string;
    description: string;
    leader: TeamMember;
    members: TeamMember[];
    createdAt: string;
}

interface Project {
    _id: string;
    name: string;
    description: string;
    team: string;
    status: string;
    createdAt: string;
}

const TeamDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [team, setTeam] = useState<Team | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
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
            if (!id) return;

            try {
                setLoading(true);
                const teamResponse = await api.get(`/teams/${id}`);
                console.log('Team response:', teamResponse.data);
                setTeam(teamResponse.data);
                setEditedTeam({
                    name: teamResponse.data.name || '',
                    description: teamResponse.data.description || '',
                });

                // Pobierz projekty zespołu
                const projectsResponse = await api.get('/projects', { params: { teamId: id } });
                console.log('Projects response:', projectsResponse.data);
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
        if (!team) return;

        setEditMode(false);
        setEditedTeam({
            name: team.name,
            description: team.description,
        });
    };

    const handleSaveEdit = async () => {
        if (!id) return;

        try {
            const response = await api.put(`/teams/${id}`, editedTeam);
            setTeam(response.data);
            setEditMode(false);
        } catch (err) {
            console.error('Error updating team:', err);
            setError('Nie udało się zaktualizować zespołu');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        if (!id) return;

        try {
            const response = await api.post(`/teams/${id}/members`, { email: newMemberEmail });
            setTeam(response.data);
            handleAddMemberClose();
        } catch (err) {
            console.error('Error adding member:', err);
            setError('Nie udało się dodać członka zespołu');
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!id) return;

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
        if (!id) return;

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

    const handleNewProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewProject({ ...newProject, [name]: value });
    };

    const handleCreateProject = async () => {
        if (!id) return;

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

    // Zabezpieczenie przed próbą dostępu do nieistniejących właściwości
    const isTeamLeader = user && team.leader && team.leader._id === user._id;

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
                            {team.description || 'Brak opisu'}
                        </Typography>

                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Lider zespołu:
                        </Typography>
                        {team.leader ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar sx={{ mr: 2 }}>{team.leader.name ? team.leader.name.charAt(0) : '?'}</Avatar>
                                <Box>
                                    <Typography variant="body1">{team.leader.name} {team.leader.lastName}</Typography>
                                    <Typography variant="body2" color="text.secondary">{team.leader.email}</Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Brak informacji o liderze
                            </Typography>
                        )}
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

                {team.members && team.members.length > 0 ? (
                    <List>
                        {team.members.map((member) => (
                            <ListItem
                                key={member._id}
                                secondaryAction={
                                    isTeamLeader && member._id !== team.leader._id && (
                                        <IconButton
                                            edge="end"
                                            color="error"
                                            onClick={() => handleRemoveMember(member._id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar>{member.name ? member.name.charAt(0) : '?'}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`${member.name || ''} ${member.lastName || ''}`}
                                    secondary={member.email}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Brak członków zespołu.
                    </Typography>
                )}
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">Projekty</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleNewProjectOpen}
                    >
                        Nowy projekt
                    </Button>
                </Box>

                {projects.length > 0 ? (
                    <Grid container spacing={2}>
                        {projects.map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project._id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" noWrap>
                                            {project.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {project.description || 'Brak opisu'}
                                        </Typography>
                                        <Chip
                                            label={project.status}
                                            color={
                                                project.status === 'completed'
                                                    ? 'success'
                                                    : project.status === 'in-progress'
                                                    ? 'primary'
                                                    : project.status === 'on-hold'
                                                    ? 'warning'
                                                    : 'default'
                                            }
                                            size="small"
                                            sx={{ mt: 1 }}
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`/projects/${project._id}`)}
                                        >
                                            Szczegóły
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Brak projektów. Stwórz pierwszy projekt dla tego zespołu.
                    </Typography>
                )}
            </Paper>

            {/* Dialog dodawania członka */}
            <Dialog open={openAddMemberDialog} onClose={handleAddMemberClose}>
                <DialogTitle>Dodaj członka zespołu</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Adres email"
                        type="email"
                        fullWidth
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
                <DialogTitle>Potwierdź usunięcie</DialogTitle>
                <DialogContent>
                    <Typography>
                        Czy na pewno chcesz usunąć zespół "{team.name}"? Tej operacji nie można cofnąć.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Anuluj</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Usuń
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog tworzenia nowego projektu */}
            <Dialog open={openNewProjectDialog} onClose={handleNewProjectClose}>
                <DialogTitle>Nowy projekt</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Nazwa projektu"
                        fullWidth
                        value={newProject.name}
                        onChange={handleNewProjectChange}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Opis projektu"
                        fullWidth
                        multiline
                        rows={4}
                        value={newProject.description}
                        onChange={handleNewProjectChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleNewProjectClose}>Anuluj</Button>
                    <Button
                        onClick={handleCreateProject}
                        variant="contained"
                        disabled={!newProject.name}
                    >
                        Utwórz
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeamDetails;

