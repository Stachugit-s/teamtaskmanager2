import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Rejestracja nowego użytkownika
router.post('/register', registerUser);

// Logowanie użytkownika
router.post('/login', loginUser);

// Pobierz profil użytkownika (chroniona trasa)
router.get('/profile', protect, getUserProfile);

export default router;