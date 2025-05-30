import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUserRequest } from '../types';

interface JwtPayload {
    id: string;
}

export const protect = async (req: IUserRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Pobierz token z nagłówka
            token = req.headers.authorization.split(' ')[1];

            // Weryfikacja tokenu
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

            // Znajdź użytkownika po ID i przypisz do req.user (bez hasła)
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Brak autoryzacji, token nieprawidłowy' });
            return;
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Brak autoryzacji, brak tokenu' });
        return;
    }
};

export const admin = (req: IUserRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Brak uprawnień administratora' });
        return;
    }
};