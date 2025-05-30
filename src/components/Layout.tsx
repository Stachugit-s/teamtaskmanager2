// src/components/Layout.tsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Divider,
    Container,
    Menu,
    MenuItem,
    CssBaseline,
    Avatar,
    useTheme,
    useMediaQuery,
    Badge,
    Tooltip,
    Chip,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Group as GroupIcon,
    Folder as FolderIcon,
    Assignment as AssignmentIcon,
    AccountCircle,
    Notifications as NotificationsIcon,
    ChevronLeft as ChevronLeftIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Close drawer on mobile when route changes
    useEffect(() => {
        if (isMobile) {
            setDrawerOpen(false);
        }
    }, [location.pathname, isMobile]);

    // Update drawer state when screen size changes
    useEffect(() => {
        setDrawerOpen(!isMobile);
    }, [isMobile]);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleClose();
    };

    const handleProfile = () => {
        // Navigate to profile when implemented
        handleClose();
    };

    const handleSettings = () => {
        // Navigate to settings when implemented
        handleClose();
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Zespoły', icon: <GroupIcon />, path: '/teams' },
        { text: 'Projekty', icon: <FolderIcon />, path: '/projects' },
        { text: 'Zadania', icon: <AssignmentIcon />, path: '/tasks' },
    ];

    // Get the current page title from the path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        if (path.includes('/teams')) return 'Zespoły';
        if (path.includes('/projects')) return 'Projekty';
        if (path.includes('/tasks')) return 'Zadania';
        return 'TeamTask Manager';
    };

    // Get user initials for the avatar
    const getUserInitials = () => {
        if (!user) return '?';
        const names = `${user.name || ''}`.split(' ');
        if (names.length === 0) return '?';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <CssBaseline />

            {/* App Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { xs: '100%', md: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
                    ml: { md: drawerOpen ? `${drawerWidth}px` : 0 },
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    zIndex: theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
                        </IconButton>

                        {location.pathname !== '/' && location.pathname.includes('/') && (
                            <Tooltip title="Powrót">
                                <IconButton
                                    color="inherit"
                                    sx={{ mr: 1 }}
                                    onClick={() => navigate(-1)}
                                >
                                    <ArrowBackIcon />
                                </IconButton>
                            </Tooltip>
                        )}

                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {getPageTitle()}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Powiadomienia">
                            <IconButton color="inherit" sx={{ mr: 1 }}>
                                <Badge badgeContent={3} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Box sx={{ position: 'relative' }}>
                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                                sx={{
                                    p: 0.5,
                                    border: user ? `2px solid ${alpha(theme.palette.primary.main, 0.5)}` : 'none',
                                    '&:hover': {
                                        border: user ? `2px solid ${theme.palette.primary.main}` : 'none',
                                    }
                                }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        width: 32,
                                        height: 32
                                    }}
                                >
                                    {getUserInitials()}
                                </Avatar>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                sx={{
                                    '& .MuiPaper-root': {
                                        borderRadius: 2,
                                        minWidth: 180,
                                        boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) 0px 16px 32px -4px',
                                        mt: 1.5,
                                    }
                                }}
                            >
                                {user && (
                                    <>
                                        <Box sx={{ px: 2, py: 1.5 }}>
                                            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold' }}>
                                                {user.name}
                                            </Typography>
                                            <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                                                {user.email}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={user.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                                                color={user.role === 'admin' ? 'primary' : 'default'}
                                                sx={{ mt: 1, height: 20, fontSize: '0.75rem' }}
                                            />
                                        </Box>
                                        <Divider />
                                    </>
                                )}
                                <MenuItem onClick={handleProfile} sx={{ py: 1 }}>
                                    <ListItemIcon>
                                        <PersonIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Mój profil" />
                                </MenuItem>
                                <MenuItem onClick={handleSettings} sx={{ py: 1 }}>
                                    <ListItemIcon>
                                        <SettingsIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Ustawienia" />
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Wyloguj się" />
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer / Side Navigation */}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={drawerOpen}
                onClose={isMobile ? handleDrawerToggle : undefined}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: `1px solid ${theme.palette.divider}`,
                    },
                }}
            >
                <Toolbar sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}>
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            fontWeight: 'bold',
                            color: theme.palette.primary.main,
                            letterSpacing: '0.5px',
                        }}
                    >
                        TeamTask
                    </Typography>
                </Toolbar>

                <Box sx={{ overflow: 'auto', py: 2, flexGrow: 1 }}>
                    <List>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path ||
                                            (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton
                                        component={Link}
                                        to={item.path}
                                        sx={{
                                            borderRadius: '0 24px 24px 0',
                                            mr: 2,
                                            ml: 1,
                                            py: 1,
                                            ...(isActive && {
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    height: '60%',
                                                    width: 4,
                                                    bgcolor: theme.palette.primary.main,
                                                    borderRadius: '0 4px 4px 0',
                                                }
                                            })
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            color: isActive ? theme.palette.primary.main : 'inherit',
                                            minWidth: 36
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontWeight: isActive ? 'bold' : 'regular',
                                                color: isActive ? theme.palette.primary.main : 'inherit',
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>

                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                        TeamTask Manager v1.0
                    </Typography>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    p: { xs: 2, sm: 3 },
                    bgcolor: '#f9fafb',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Container maxWidth="xl" sx={{ py: 2 }}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
