import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/rbac.js';
import {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updateMemberRole,
} from '../controllers/teamController.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', checkRole('admin', 'team_leader'), createTeam);
router.get('/', getTeams);
router.get('/:teamId', getTeam);
router.put('/:teamId', updateTeam);
router.delete('/:teamId', deleteTeam);

router.post('/:teamId/members', addMember);
router.delete('/:teamId/members/:userId', removeMember);
router.patch('/:teamId/members/:userId/role', updateMemberRole);

export default router;
