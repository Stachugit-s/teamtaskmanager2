import mongoose, { Schema } from 'mongoose';
import { ITeam } from '../types';

const teamSchema = new Schema<ITeam>(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
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
    },
    {
        timestamps: true,
    }
);

const Team = mongoose.model<ITeam & Document>('Team', teamSchema);

export default Team;