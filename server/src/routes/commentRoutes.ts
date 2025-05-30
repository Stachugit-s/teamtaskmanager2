import express from 'express';
import {
    createComment,
    getTaskComments,
    updateComment,
    deleteComment
} from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createComment);

router.route('/task/:taskId')
    .get(getTaskComments);

router.route('/:id')
    .put(updateComment)
    .delete(deleteComment);

export default router;