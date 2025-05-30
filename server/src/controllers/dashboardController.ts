import { Request, Response } from 'express';
import Team from '../models/Team';
import Project from '../models/Project';
import Task from '../models/Task';
import { IUserRequest } from '../types';

export const getDashboardStats = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        // Znajdź zespoły użytkownika
        const teams = await Team.find({
            $or: [
                { leader: req.user._id },
                { members: { $in: [req.user._id] } }
            ]
        });

        const teamIds = teams.map(team => team._id);

        // Znajdź projekty w tych zespołach
        const projects = await Project.find({ team: { $in: teamIds } });
        const projectIds = projects.map(project => project._id);

        // Znajdź zadania w tych projektach
        const tasks = await Task.find({ project: { $in: projectIds } });

        // Zadania przypisane do użytkownika
        const userTasks = await Task.find({
            project: { $in: projectIds },
            assignedTo: req.user._id
        });

        // Statystyki zadań wg statusu
        const tasksByStatus = {
            todo: tasks.filter(task => task.status === 'todo').length,
            inProgress: tasks.filter(task => task.status === 'in-progress').length,
            review: tasks.filter(task => task.status === 'review').length,
            completed: tasks.filter(task => task.status === 'completed').length
        };

        // Statystyki zadań użytkownika wg statusu
        const userTasksByStatus = {
            todo: userTasks.filter(task => task.status === 'todo').length,
            inProgress: userTasks.filter(task => task.status === 'in-progress').length,
            review: userTasks.filter(task => task.status === 'review').length,
            completed: userTasks.filter(task => task.status === 'completed').length
        };

        // Statystyki zadań wg priorytetu
        const tasksByPriority = {
            low: tasks.filter(task => task.priority === 'low').length,
            medium: tasks.filter(task => task.priority === 'medium').length,
            high: tasks.filter(task => task.priority === 'high').length
        };

        // Projekty wg statusu
        const projectsByStatus = {
            planned: projects.filter(project => project.status === 'planned').length,
            inProgress: projects.filter(project => project.status === 'in-progress').length,
            onHold: projects.filter(project => project.status === 'on-hold').length,
            completed: projects.filter(project => project.status === 'completed').length
        };

        // Zadania z najbliższym terminem
        const upcomingTasks = await Task.find({
            project: { $in: projectIds },
            dueDate: { $gte: new Date() },
            status: { $ne: 'completed' }
        })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate('project', 'name')
            .populate('assignedTo', 'name email');

        // Ostatnio zakończone zadania
        const recentlyCompletedTasks = await Task.find({
            project: { $in: projectIds },
            status: 'completed'
        })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('project', 'name')
            .populate('assignedTo', 'name email');

        const stats = {
            totalTeams: teams.length,
            totalProjects: projects.length,
            totalTasks: tasks.length,
            userAssignedTasks: userTasks.length,
            tasksByStatus,
            userTasksByStatus,
            tasksByPriority,
            projectsByStatus,
            upcomingTasks,
            recentlyCompletedTasks
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};