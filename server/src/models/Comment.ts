import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types';

const commentSchema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Comment = mongoose.model<IComment & Document>('Comment', commentSchema);

export default Comment;