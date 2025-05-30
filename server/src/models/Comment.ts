import mongoose, { Schema } from 'mongoose';
import { ICommentDocument } from '../types';

const commentSchema = new Schema({
    text: { type: String, required: true },
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model<ICommentDocument>('Comment', commentSchema);

export default Comment;