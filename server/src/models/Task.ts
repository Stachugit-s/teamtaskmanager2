import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types';

const taskSchema = new Schema<ITask>(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ['to-do', 'in-progress', 'completed'],
            default: 'to-do',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model<ITask & Document>('Task', taskSchema);

export default Task;