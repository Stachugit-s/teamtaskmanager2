import mongoose, { Schema } from 'mongoose';
import { ITaskDocument } from '../types';

const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'completed'],
        default: 'todo'
    },
    createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

export default Task;