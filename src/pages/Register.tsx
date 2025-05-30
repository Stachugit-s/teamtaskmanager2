// src/pages/Register.tsx
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Link,
    Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Hasła nie są identyczne');
            setLoading(false);
            return;
        }

        try {
            await register(name, lastName, email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas rejestracji');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                width: '100vw',
                background: 'linear-gradient(45deg, #f5f5f5 0%, #e0e0e0 100%)',
                position: 'absolute',
                top: 0,
                left: 0,
                margin: 0,
                padding: 0
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    width: '100%',
                    maxWidth: '450px',
                    mx: 2
                }}
            >
                <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    TeamTask Manager
                </Typography>
                <Typography component="h2" variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                    Rejestracja
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Imię"
                        name="name"
                        autoComplete="given-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="lastName"
                        label="Nazwisko"
                        name="lastName"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Adres email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Hasło"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Potwierdź hasło"
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                            mt: 1,
                            mb: 3,
                            py: 1.2,
                            borderRadius: 2,
                            fontWeight: 'bold'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Rejestracja...' : 'Zarejestruj się'}
                    </Button>
                    <Box textAlign="center">
                        <Link component={RouterLink} to="/login" variant="body2" sx={{ textDecoration: 'none' }}>
                            {"Masz już konto? Zaloguj się"}
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Register;

