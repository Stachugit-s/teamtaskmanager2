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
    Container,
    Paper,
    IconButton,
    Tooltip,
    Chip,
    Divider,
    Stack,
    InputAdornment,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Group as GroupIcon,
    Search as SearchIcon,
    PersonAdd as PersonAddIcon,
    ArrowForward as ArrowForwardIcon,
    MoreVert as MoreVertIcon,
    CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Team {
    _id: string;
    name: string;
    description: string;
    leader: { _id: string; name: string; lastName?: string; email: string };
    members: { _id: string; name: string; lastName?: string; email: string }[];
    createdAt: string;
}

const Teams = () => {
    const theme = useTheme();
    const [teams, setTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', description: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { token, user } = useAuth();

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get('/teams', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Teams response:', response.data);
                setTeams(response.data);
                setFilteredTeams(response.data);
            } catch (err) {
                console.error('Error fetching teams:', err);
                setError('Nie udało się pobrać zespołów');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchTeams();
        } else {
            setLoading(false);
        }
    }, [token]);

    // Filter teams when search term changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredTeams(teams);
            return;
        }

        const filtered = teams.filter(team =>
            team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTeams(filtered);
    }, [searchTerm, teams]);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewTeam({ name: '', description: '' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewTeam({ ...newTeam, [name]: value });
    };

    const handleCreateTeam = async () => {
        try {
            // Upewnij się, że nazwa zespołu nie jest pusta
            if (!newTeam.name.trim()) {
                setError('Nazwa zespołu nie może być pusta');
                return;
            }

            const response = await api.post('/teams', newTeam, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Create team response:', response.data);

            // Dodaj nowo utworzony zespół do listy i przekieruj do strony szczegółów zespołu
            setTeams([...teams, response.data]);
            handleCloseDialog();
            navigate(`/teams/${response.data._id}`);
        } catch (err: any) {
            console.error('Error creating team:', err);
            setError(err.response?.data?.message || 'Nie udało się utworzyć zespołu');
        }
    };

    // Helper function to get initials from name
    const getInitials = (name: string) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    // Format date string
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pl-PL', options);
    };

    // Check if user is leader of a team
    const isTeamLeader = (team: Team) => {
        return team.leader._id === user?._id;
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                    Ładowanie zespołów...
                </Typography>
            </Box>
        );
    }

    // Sprawdź, czy użytkownik jest zalogowany
    if (!token) {
        return (
            <Alert severity="warning" sx={{ mt: 2 }}>
                Musisz być zalogowany, aby zobaczyć swoje zespoły.
            </Alert>
        );
    }

    return (
        <Box>
            {/* Nagłówek z tytułem, wyszukiwarką i przyciskiem dodawania */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mb: 4,
                    gap: 2
                }}
            >
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        Zespoły
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Zarządzaj swoimi zespołami i współpracownikami
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                    <TextField
                        placeholder="Szukaj zespołu..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            minWidth: { xs: '100%', sm: 220 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        sx={{
                            borderRadius: 2,
                            boxShadow: 2,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Nowy zespół
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Lista zespołów */}
            <Grid container spacing={3}>
                {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => (
                        <Grid item xs={12} sm={6} md={4} key={team._id}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                                noWrap
                                                sx={{
                                                    fontWeight: 'bold',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    maxWidth: '240px'
                                                }}
                                            >
                                                {team.name}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Utworzono: {formatDate(team.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {isTeamLeader(team) && (
                                            <Chip
                                                label="Lider"
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ height: 24, fontWeight: 'medium' }}
                                            />
                                        )}
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 3,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            minHeight: '4.5em'
                                        }}
                                    >
                                        {team.description || 'Brak opisu'}
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Lider:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                sx={{
                                                    width: 30,
                                                    height: 30,
                                                    mr: 1,
                                                    bgcolor: theme.palette.primary.main,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {getInitials(team.leader?.name)}
                                            </Avatar>
                                            <Typography variant="body2">
                                                {team.leader?.name} {team.leader?.lastName || ''}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Członkowie ({team.members?.length || 0}):
                                        </Typography>
                                        {team.members && team.members.length > 0 ? (
                                            <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
                                                {team.members.map((member) => (
                                                    <Tooltip
                                                        key={member._id}
                                                        title={`${member.name} ${member.lastName || ''}`}
                                                        arrow
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                width: 30,
                                                                height: 30,
                                                                fontSize: '0.875rem',
                                                                bgcolor: alpha(theme.palette.primary.main, 0.7)
                                                            }}
                                                        >
                                                            {getInitials(member.name)}
                                                        </Avatar>
                                                    </Tooltip>
                                                ))}
                                            </AvatarGroup>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Brak członków zespołu
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>

                                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        component={Link}
                                        to={`/teams/${team._id}`}
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{
                                            borderRadius: 2,
                                            boxShadow: 'none',
                                            '&:hover': {
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                            }
                                        }}
                                    >
                                        Szczegóły
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            }}
                        >
                            {searchTerm ? (
                                <>
                                    <Typography variant="h6" gutterBottom>
                                        Nie znaleziono zespołów
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                        Nie znaleziono zespołów pasujących do zapytania "{searchTerm}"
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h6" gutterBottom>
                                        Nie masz jeszcze żadnych zespołów
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        Stwórz swój pierwszy zespół, aby rozpocząć pracę nad projektami
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenDialog}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Utwórz pierwszy zespół
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Dialog tworzenia nowego zespołu */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Nowy zespół
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Utwórz nowy zespół i zaproś członków do współpracy
                    </Typography>
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
                        sx={{ mb: 3 }}
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
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
                        sx={{ mb: 1 }}
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 3 }}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        sx={{ borderRadius: 2, mr: 1 }}
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleCreateTeam}
                        variant="contained"
                        disabled={!newTeam.name.trim()}
                        startIcon={<GroupIcon />}
                        sx={{ borderRadius: 2 }}
                    >
                        Utwórz zespół
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Teams;

