import { Request, Response } from 'express';
import Team from '../models/Team';
import { IUserRequest } from '../types';
import { Types } from 'mongoose';

// @desc    Utwórz nowy zespół
// @route   POST /api/teams
// @access  Private
export const createTeam = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const team = await Team.create({
            name,
            description,
            leader: req.user._id,
            members: [req.user._id], // Dodaj lidera jako członka zespołu
        });

        if (team) {
            res.status(201).json(team);
        } else {
            res.status(400).json({ message: 'Nieprawidłowe dane zespołu' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// @desc    Pobierz wszystkie zespoły użytkownika
// @route   GET /api/teams
// @access  Private
export const getTeams = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        // Znajdź zespoły, w których użytkownik jest liderem lub członkiem
        const teams = await Team.find({
            $or: [
                { leader: req.user._id },
                { members: { $in: [req.user._id] } }
            ]
        }).populate('leader', 'name email').populate('members', 'name email');

        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// @desc    Pobierz pojedynczy zespół
// @route   GET /api/teams/:id
// @access  Private
export const getTeamById = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const team = await Team.findById(req.params.id)
            .populate('leader', 'name email')
            .populate('members', 'name email');

        if (team) {
            // Sprawdź, czy użytkownik jest członkiem lub liderem zespołu
            const isMember = team.members.some((member: any) =>
                member._id.toString() === req.user?._id.toString()
            );
            const isLeader = team.leader._id.toString() === req.user?._id.toString();

            if (isMember || isLeader || req.user?.role === 'admin') {
                res.json(team);
            } else {
                res.status(403).json({ message: 'Brak dostępu do tego zespołu' });
            }
        } else {
            res.status(404).json({ message: 'Zespół nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// @desc    Aktualizuj zespół
// @route   PUT /api/teams/:id
// @access  Private (tylko lider zespołu lub admin)
export const updateTeam = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const team = await Team.findById(req.params.id);

        if (team) {
            // Sprawdź, czy użytkownik jest liderem zespołu lub adminem
            if (team.leader.toString() === req.user._id.toString() || req.user.role === 'admin') {
                team.name = name || team.name;
                team.description = description || team.description;

                const updatedTeam = await team.save();
                res.json(updatedTeam);
            } else {
                res.status(403).json({ message: 'Tylko lider zespołu może go edytować' });
            }
        } else {
            res.status(404).json({ message: 'Zespół nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// @desc    Dodaj członka do zespołu
// @route   POST /api/teams/:id/members
// @access  Private (tylko lider zespołu lub admin)
export const addTeamMember = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const team = await Team.findById(req.params.id);

        if (team) {
            // Sprawdź, czy użytkownik jest liderem zespołu lub adminem
            if (team.leader.toString() === req.user._id.toString() || req.user.role === 'admin') {
                // Sprawdź, czy użytkownik już jest członkiem zespołu
                const isMember = team.members.some((member: Types.ObjectId) => member.toString() === userId);

                if (isMember) {
                    res.status(400).json({ message: 'Użytkownik już jest członkiem zespołu' });
                    return;
                }

                team.members.push(userId as unknown as Types.ObjectId);
                await team.save();

                const updatedTeam = await Team.findById(req.params.id)
                    .populate('leader', 'name email')
                    .populate('members', 'name email');

                res.json(updatedTeam);
            } else {
                res.status(403).json({ message: 'Tylko lider zespołu może dodawać członków' });
            }
        } else {
            res.status(404).json({ message: 'Zespół nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// @desc    Usuń członka z zespołu
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (tylko lider zespołu lub admin)
export const removeTeamMember = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const team = await Team.findById(req.params.id);

        if (team) {
            // Sprawdź, czy użytkownik jest liderem zespołu lub adminem
            if (team.leader.toString() === req.user._id.toString() || req.user.role === 'admin') {
                // Nie pozwól na usunięcie lidera zespołu
                if (userId === team.leader.toString()) {
                    res.status(400).json({ message: 'Nie można usunąć lidera zespołu' });
                    return;
                }

                // Usuń członka z zespołu
                team.members = team.members.filter((member: Types.ObjectId) => member.toString() !== userId);
                await team.save();

                const updatedTeam = await Team.findById(req.params.id)
                    .populate('leader', 'name email')
                    .populate('members', 'name email');

                res.json(updatedTeam);
            } else {
                res.status(403).json({ message: 'Tylko lider zespołu może usuwać członków' });
            }
        } else {
            res.status(404).json({ message: 'Zespół nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// @desc    Usuń zespół
// @route   DELETE /api/teams/:id
// @access  Private (tylko lider zespołu lub admin)
export const deleteTeam = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const team = await Team.findById(req.params.id);

        if (team) {
            // Sprawdź, czy użytkownik jest liderem zespołu lub adminem
            if (team.leader.toString() === req.user._id.toString() || req.user.role === 'admin') {
                await Team.deleteOne({ _id: req.params.id });
                res.json({ message: 'Zespół usunięty' });
            } else {
                res.status(403).json({ message: 'Tylko lider zespołu może go usunąć' });
            }
        } else {
            res.status(404).json({ message: 'Zespół nie znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};