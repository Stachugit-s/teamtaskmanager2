// src/pages/Teams.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    CircularProgress,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Avatar,
    AvatarGroup,
    Chip,
} from '@mui/material';
import { Add as AddIcon, Group as GroupIcon } from '@mui/icons-material';
import api from '../api/axios';

interface Team {
    _id: string;
    name: string;
    description: string;
    leader: { _id: string; name: string; email: string };
    members: { _id: string; name: string; email: string }[];
    createdAt: string;
}

const Teams = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', description: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get('/teams');
                setTeams(response.data);
            } catch (err) {
                console.error('Error fetching teams:', err);
                setError('Nie udało się pobrać zespołów');
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewTeam({ name: '', description: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTeam({ ...newTeam, [name]: value });
    };

    const handleCreateTeam = async () => {
        try {
            const response = await api.post('/teams', newTeam);
            setTeams([...teams, response.data]);
            handleCloseDialog();
        } catch (err) {
            console.error('Error creating team:', err);
            setError('Nie udało się utworzyć zespołu');
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
                <Typography variant="h4">Zespoły</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
                    Nowy zespół
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {teams.length > 0 ? (
                    teams.map((team) => (
                        <Grid item xs={12} sm={6} md={4} key={team._id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {team.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {team.description}
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            Lider:
                                        </Typography>
                                        <Typography variant="body2">{team.leader.name}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Członkowie ({team.members.length}):
                                        </Typography>
                                        <AvatarGroup max={5}>
                                            {team.members.map((member) => (
                                                <Avatar key={member._id} alt={member.name} src="">
                                                    {member.name.charAt(0)}
                                                </Avatar>
                                            ))}
                                        </AvatarGroup>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        component={Link}
                                        to={`/teams/${team._id}`}
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
                            Nie masz jeszcze żadnych zespołów. Utwórz swój pierwszy zespół!
                        </Alert>
                    </Grid>
                )}
            </Grid>

            {/* Dialog tworzenia nowego zespołu */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Nowy zespół</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Nazwa zespołu"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newTeam.name}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        name="description"
                        label="Opis zespołu"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        value={newTeam.description}
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anuluj</Button>
                    <Button
                        onClick={handleCreateTeam}
                        variant="contained"
                        disabled={!newTeam.name.trim()}
                    >
                        Utwórz
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Teams;