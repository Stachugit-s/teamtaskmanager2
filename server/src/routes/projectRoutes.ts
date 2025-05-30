import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createProject)
    .get(getProjects);

router.route('/:id')
    .get(getProjectById)
    .put(updateProject)
    .delete(deleteProject);

export default router;