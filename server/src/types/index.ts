import { Request } from 'express';
import { Document, Types } from 'mongoose';

// Rozszerzenie interfejsu Request aby uwzględniał obiekt user
export interface IUserRequest extends Request {
    user?: IUserDocument;
}

// Interface dla dokumentu użytkownika
export interface IUser {
    name: string;
    lastName: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
}

export interface IUserDocument extends IUser, Document {
    _id: Types.ObjectId;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

// Interface dla zespołu
export interface ITeam {
    name: string;
    description: string;
    leader: Types.ObjectId;
    members: Types.ObjectId[];
    createdAt: Date;
}

export interface ITeamDocument extends ITeam, Document {
    _id: Types.ObjectId;
}

// Interface dla projektu
export interface IProject {
    name: string;
    description?: string;
    team: string; // ID zespołu
}

// Interface dla zadania
export interface ITask {
    title: string;
    description?: string;
    status: 'to-do' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: string; // ID użytkownika
    project: string; // ID projektu
}

// Interface dla komentarza
export interface IComment {
    content: string;
    task: string; // ID zadania
    author: string; // ID użytkownika
}