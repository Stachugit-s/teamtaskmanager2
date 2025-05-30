// src/pages/Projects.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Chip,
    LinearProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import api from '../api/axios';

interface Project {
    _id: string;
    name: string;
    description: string;
    team: { _id: string; name: string };
    createdBy: { _id: string; name: string; email: string };
    startDate: string;
    endDate?: string;
    status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
    createdAt: string;
}

interface Team {
    _id: string;
    name: string;
}

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        team: '',
        startDate: '',
        endDate: '',
        status: 'planned',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Pobierz zespoły użytkownika
                const teamsResponse = await api.get('/teams');
                setTeams(teamsResponse.data);

                // Pobierz projekty (opcjonalnie filtrowane po zespole)
                const projectsResponse = await api.get('/projects', {
                    params: { teamId: selectedTeam || undefined }
                });
                setProjects(projectsResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Wystąpił błąd podczas ładowania danych');
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedTeam]);

    const handleTeamChange = (event) => {
        setSelectedTeam(event.target.value);
    };

    const handleOpenDialog = () => {
        if (teams.length === 0) {
            setError('Musisz najpierw utworzyć zespół, aby dodać projekt');
            return;
        }
        setNewProject({ ...newProject, team: teams[0]._id });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewProject({
            name: '',
            description: '',
            team: '',
            startDate: '',
            endDate: '',
            status: 'planned',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject({ ...newProject, [name]: value });
    };

    const handleCreateProject = async () => {
        try {
            const response = await api.post('/projects', newProject);
            setProjects([...projects, response.data]);
            handleCloseDialog();
        } catch (err) {
            console.error('Error creating project:', err);
            setError('Nie udało się utworzyć projektu');
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4">Projekty</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                        <InputLabel id="team-select-label">Zespół</InputLabel>
                        <Select
                            labelId="team-select-label"
                            id="team-select"
                            value={selectedTeam}
                            onChange={handleTeamChange}
                            label="Zespół"
                        >
                            <MenuItem value="">Wszystkie zespoły</MenuItem>
                            {teams.map((team) => (
                                <MenuItem key={team._id} value={team._id}>
                                    {team.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                    >
                        Nowy projekt
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project._id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {project.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {project.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Chip
                                            label={getStatusLabel(project.status)}
                                            color={getStatusColor(project.status)}
                                            size="small"
                                        />
                                        <Typography variant="caption">
                                            Zespół: {project.team.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                            Utworzono: {new Date(project.createdAt).toLocaleDateString()}
                                        </Typography>
                                        {project.startDate && (
                                            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                                Start: {new Date(project.startDate).toLocaleDateString()}
                                            </Typography>
                                        )}
                                        {project.endDate && (
                                            <Typography variant="caption" display="block">
                                                Koniec: {new Date(project.endDate).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>
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
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            Nie masz jeszcze żadnych projektów. Utwórz swój pierwszy projekt!
                        </Alert>
                    </Grid>
                )}
            </Grid>

            {/* Dialog tworzenia nowego projektu */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
                        <InputLabel id="team-label">Zespół</InputLabel>
                        <Select
                            labelId="team-label"
                            id="team"
                            name="team"
                            value={newProject.team}
                            onChange={handleInputChange}
                            label="Zespół"
                        >
                            {teams.map((team) => (
                                <MenuItem key={team._id} value={team._id}>
                                    {team.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="startDate"
                        name="startDate"
                        label="Data rozpoczęcia"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={newProject.startDate}
                        onChange={handleInputChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        id="endDate"
                        name="endDate"
                        label="Planowana data zakończenia"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={newProject.endDate}
                        onChange={handleInputChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status"
                            name="status"
                            value={newProject.status}
                            onChange={handleInputChange}
                            label="Status"
                        >
                            <MenuItem value="planned">Planowany</MenuItem>
                            <MenuItem value="in-progress">W trakcie</MenuItem>
                            <MenuItem value="on-hold">Wstrzymany</MenuItem>
                            <MenuItem value="completed">Zakończony</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anuluj</Button>
                    <Button
                        onClick={handleCreateProject}
                        variant="contained"
                        disabled={!newProject.name.trim() || !newProject.team}
                    >
                        Utwórz
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Projects;