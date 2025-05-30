import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/stats')
    .get(getDashboardStats);

export default router;