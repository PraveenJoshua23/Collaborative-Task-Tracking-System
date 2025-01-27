import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  getProfile,
  updateProfile,
  deleteProfile,
  changePassword,
  getActivity,
  uploadAvatar,
  getTeams,
} from '../controllers/profileController.js';
import {
  handleUploadError,
  uploadAvatarMiddleware,
} from '../middlewares/upload.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.delete('/', deleteProfile);
router.put('/password', changePassword);
router.get('/activity', getActivity);
router.post('/avatar', handleUploadError, uploadAvatarMiddleware, uploadAvatar);
router.get('/teams', getTeams);

export default router;
