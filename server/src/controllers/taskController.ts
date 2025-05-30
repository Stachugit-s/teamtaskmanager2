import { Request, Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import Team from '../models/Team';
import { IUserRequest } from '../types';

export const createTask = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { title, description, project, assignedTo, dueDate, priority, status } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const projectExists = await Project.findById(project);
        if (!projectExists) {
            res.status(404).json({ message: 'Projekt nie istnieje' });
            return;
        }

        const team = await Team.findById(projectExists.team);
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

        const task = await Task.create({
            title,
            description,
            project,
            assignedTo,
            createdBy: req.user._id,
            dueDate,
            priority: priority || 'medium',
            status: status || 'todo',
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const getTasks = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const { projectId, assignedTo } = req.query;
        let query: any = {};

        if (projectId) {
            query.project = projectId;

            const project = await Project.findById(projectId);
            if (!project) {
                res.status(404).json({ message: 'Projekt nie istnieje' });
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
        } else {
            // Jeśli nie podano projectId, pobierz zadania z projektów, w których uczestniczy użytkownik
            const userTeams = await Team.find({
                $or: [
                    { leader: req.user._id },
                    { members: { $in: [req.user._id] } }
                ]
            });

            const teamIds = userTeams.map(team => team._id);
            const projects = await Project.find({ team: { $in: teamIds } });
            const projectIds = projects.map(project => project._id);

            query.project = { $in: projectIds };
        }

        // Filtruj zadania przypisane do konkretnego użytkownika jeśli podano
        if (assignedTo) {
            query.assignedTo = assignedTo;
        }

        const tasks = await Task.find(query)
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const getTaskById = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const task = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            res.status(404).json({ message: 'Zadanie nie znalezione' });
            return;
        }

        const project = await Project.findById(task.project);
        if (!project) {
            res.status(404).json({ message: 'Projekt zadania nie istnieje' });
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
            res.status(403).json({ message: 'Brak uprawnień do tego zadania' });
            return;
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const updateTask = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { title, description, assignedTo, dueDate, priority, status } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            res.status(404).json({ message: 'Zadanie nie znalezione' });
            return;
        }

        const project = await Project.findById(task.project);
        if (!project) {
            res.status(404).json({ message: 'Projekt zadania nie istnieje' });
            return;
        }

        const team = await Team.findById(project.team);
        if (!team) {
            res.status(404).json({ message: 'Zespół projektu nie istnieje' });
            return;
        }

        const isLeader = team.leader.toString() === req.user._id.toString();
        const isCreator = task.createdBy.toString() === req.user._id.toString();
        const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

        if (!isLeader && !isCreator && !isAssigned && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Brak uprawnień do edycji tego zadania' });
            return;
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.assignedTo = assignedTo || task.assignedTo;
        task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;
        task.priority = priority || task.priority;
        task.status = status || task.status;

        const updatedTask = await task.save();

        const populatedTask = await Task.findById(updatedTask._id)
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const deleteTask = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            res.status(404).json({ message: 'Zadanie nie znalezione' });
            return;
        }

        const project = await Project.findById(task.project);
        if (!project) {
            res.status(404).json({ message: 'Projekt zadania nie istnieje' });
            return;
        }

        const team = await Team.findById(project.team);
        if (!team) {
            res.status(404).json({ message: 'Zespół projektu nie istnieje' });
            return;
        }

        const isLeader = team.leader.toString() === req.user._id.toString();
        const isCreator = task.createdBy.toString() === req.user._id.toString();

        if (!isLeader && !isCreator && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Tylko lider zespołu lub twórca zadania może je usunąć' });
            return;
        }

        await Task.deleteOne({ _id: req.params.id });

        res.json({ message: 'Zadanie usunięte' });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};