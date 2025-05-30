import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { IUserDocument, IUserRequest } from '../types';

// @desc    Rejestracja nowego użytkownika
// @route   POST /api/users
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, lastName, email, password } = req.body;

        // Sprawdź czy użytkownik już istnieje
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'Użytkownik już istnieje' });
            return;
        }

        // Utwórz nowego użytkownika
        const user = await User.create({
            name,
            lastName,
            email,
            password,
        }) as IUserDocument;  // Dodajemy jawne rzutowanie na IUserDocument

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(400).json({ message: 'Nieprawidłowe dane użytkownika' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// @desc    Logowanie użytkownika / uzyskiwanie tokenu
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Znajdź użytkownika po emailu
        const user = await User.findOne({ email }) as IUserDocument | null;  // Jawne rzutowanie

        // Sprawdź czy użytkownik istnieje i czy hasło jest prawidłowe
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// @desc    Pobierz profil użytkownika
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const user = await User.findById(req.user._id) as IUserDocument | null;  // Jawne rzutowanie

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'Użytkownik nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};