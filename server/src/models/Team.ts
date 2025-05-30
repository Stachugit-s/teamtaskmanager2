import mongoose, { Schema } from 'mongoose';
import { ITeamDocument } from '../types';

const teamSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    leader: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Team = mongoose.model<ITeamDocument>('Team', teamSchema);

export default Team;