import mongoose, { Schema } from 'mongoose';
import { IProject } from '../types';

const projectSchema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        team: {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Project = mongoose.model<IProject & Document>('Project', projectSchema);

export default Project;