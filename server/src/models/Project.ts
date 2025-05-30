import mongoose, { Schema } from 'mongoose';
import { IProjectDocument } from '../types';

const projectSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: {
        type: String,
        enum: ['planned', 'in-progress', 'completed', 'on-hold'],
        default: 'planned'
    },
    createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.model<IProjectDocument>('Project', projectSchema);

export default Project;