import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Task from '../models/Task';
import Project from '../models/Project';
import Team from '../models/Team';
import { IUserRequest } from '../types';

export const createComment = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { text, taskId } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404).json({ message: 'Zadanie nie istnieje' });
            return;
        }

        const project = await Project.findById(task.project);
        if (!project) {
            res.status(404).json({ message: 'Projekt nie istnieje' });
            return;
        }

        const team = await Team.findById(project.team);
        if (!team) {
            res.status(404).json({ message: 'Zespół nie istnieje' });
            return;
        }

        const isMember = team.members.some((member: any) =>
            member.toString() === req.user?._id.toString()
        );
        const isLeader = team.leader.toString() === req.user?._id.toString();

        if (!isMember && !isLeader && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Brak uprawnień do komentowania zadania w tym zespole' });
            return;
        }

        const comment = await Comment.create({
            text,
            task: taskId,
            user: req.user._id,
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('user', 'name email');

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const getTaskComments = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const task = await Task.findById(taskId);
        if (!task) {
            res.status(404).json({ message: 'Zadanie nie istnieje' });
            return;
        }

        const project = await Project.findById(task.project);
        if (!project) {
            res.status(404).json({ message: 'Projekt nie istnieje' });
            return;
        }

        const team = await Team.findById(project.team);
        if (!team) {
            res.status(404).json({ message: 'Zespół nie istnieje' });
            return;
        }

        const isMember = team.members.some((member: any) =>
            member.toString() === req.user?._id.toString()
        );
        const isLeader = team.leader.toString() === req.user?._id.toString();

        if (!isMember && !isLeader && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Brak uprawnień do przeglądania komentarzy w tym zespole' });
            return;
        }

        const comments = await Comment.find({ task: taskId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const updateComment = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { text } = req.body;
        const { id } = req.params;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            res.status(404).json({ message: 'Komentarz nie istnieje' });
            return;
        }

        // Tylko autor komentarza lub admin może go edytować
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Nie masz uprawnień do edycji tego komentarza' });
            return;
        }

        comment.text = text || comment.text;
        const updatedComment = await comment.save();

        const populatedComment = await Comment.findById(updatedComment._id)
            .populate('user', 'name email');

        res.json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const deleteComment = async (req: IUserRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!req.user) {
            res.status(401).json({ message: 'Brak autoryzacji' });
            return;
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            res.status(404).json({ message: 'Komentarz nie istnieje' });
            return;
        }

        const task = await Task.findById(comment.task);
        if (!task) {
            res.status(404).json({ message: 'Zadanie nie istnieje' });
            return;
        }

        const project = await Project.findById(task.project);
        const team = project ? await Team.findById(project.team) : null;
        const isTeamLeader = team ? team.leader.toString() === req.user._id.toString() : false;
        const isCommentAuthor = comment.user.toString() === req.user._id.toString();

        // Tylko autor komentarza, lider zespołu lub admin może usunąć komentarz
        if (!isCommentAuthor && !isTeamLeader && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Nie masz uprawnień do usunięcia tego komentarza' });
            return;
        }

        await Comment.deleteOne({ _id: id });
        res.json({ message: 'Komentarz usunięty' });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};