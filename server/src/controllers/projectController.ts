import { Request, Response } from 'express';
import Project from '../models/Project';
import Team from '../models/Team';
import { IUserRequest } from '../types';

export const createProject = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { name, description, team, startDate, endDate, status } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const teamExists = await Team.findById(team);
        if (!teamExists) {
            res.status(404).json({ message: 'Zespół nie istnieje' });
            return;
        }

        const isMember = teamExists.members.some((member: any) =>
            member.toString() === req.user?._id.toString()
        );
        const isLeader = teamExists.leader.toString() === req.user?._id.toString();

        if (!isMember && !isLeader && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Brak uprawnień do tego zespołu' });
            return;
        }

        const project = await Project.create({
            name,
            description,
            team,
            createdBy: req.user._id,
            startDate: startDate || Date.now(),
            endDate,
            status: status || 'planned',
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const getProjects = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const { teamId } = req.query;
        let query = {};

        if (teamId) {
            query = { team: teamId };

            const team = await Team.findById(teamId);
            if (!team) {
                res.status(404).json({ message: 'Zespół nie istnieje' });
                return;
            }

            const isMember = team.members.some((member: any) =>
                member.toString() === req.user?._id.toString()
            );
            const isLeader = team.leader.toString() === req.user?._id.toString();

            if (!isMember && !isLeader && req.user.role !== 'admin') {
                res.status(403).json({ message: 'Brak uprawnień do tego zespołu' });
                return;
            }
        } else {
            const userTeams = await Team.find({
                $or: [
                    { leader: req.user._id },
                    { members: { $in: [req.user._id] } }
                ]
            });

            const teamIds = userTeams.map(team => team._id);
            query = { team: { $in: teamIds } };
        }

        const projects = await Project.find(query)
            .populate('team', 'name')
            .populate('createdBy', 'name email');

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const getProjectById = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const project = await Project.findById(req.params.id)
            .populate('team', 'name description')
            .populate('createdBy', 'name email');

        if (!project) {
            res.status(404).json({ message: 'Projekt nie znaleziony' });
            return;
        }

        const team = await Team.findById(project.team);
        if (!team) {
            res.status(404).json({ message: 'Zespół projektu nie istnieje' });
            return;
        }

        const isMember = team.members.some((member: any) =>
            member.toString() === req.user?._id.toString()
        );
        const isLeader = team.leader.toString() === req.user?._id.toString();

        if (!isMember && !isLeader && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Brak uprawnień do tego projektu' });
            return;
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const updateProject = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { name, description, startDate, endDate, status } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: 'Projekt nie znaleziony' });
            return;
        }

        const team = await Team.findById(project.team);
        if (!team) {
            res.status(404).json({ message: 'Zespół projektu nie istnieje' });
            return;
        }

        const isLeader = team.leader.toString() === req.user._id.toString();
        const isCreator = project.createdBy.toString() === req.user._id.toString();

        if (!isLeader && !isCreator && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Tylko lider zespołu lub twórca projektu może go edytować' });
            return;
        }

        project.name = name || project.name;
        project.description = description || project.description;
        project.startDate = startDate ? new Date(startDate) : project.startDate;
        project.endDate = endDate ? new Date(endDate) : project.endDate;
        project.status = status || project.status;

        const updatedProject = await project.save();

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const deleteProject = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: 'Projekt nie znaleziony' });
            return;
        }

        const team = await Team.findById(project.team);
        if (!team) {
            res.status(404).json({ message: 'Zespół projektu nie istnieje' });
            return;
        }

        const isLeader = team.leader.toString() === req.user._id.toString();
        const isCreator = project.createdBy.toString() === req.user._id.toString();

        if (!isLeader && !isCreator && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Tylko lider zespołu lub twórca projektu może go usunąć' });
            return;
        }

        await Project.deleteOne({ _id: req.params.id });

        res.json({ message: 'Projekt usunięty' });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};