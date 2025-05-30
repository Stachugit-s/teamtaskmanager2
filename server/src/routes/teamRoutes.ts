import express from 'express';
import {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    deleteTeam
} from '../controllers/teamController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Wszystkie trasy wymagają uwierzytelnienia
router.use(protect);

router.route('/')
    .post(createTeam)
    .get(getTeams);

router.route('/:id')
    .get(getTeamById)
    .put(updateTeam)
    .delete(deleteTeam);

router.route('/:id/members')
    .post(addTeamMember);

router.route('/:id/members/:userId')
    .delete(removeTeamMember);

export default router;