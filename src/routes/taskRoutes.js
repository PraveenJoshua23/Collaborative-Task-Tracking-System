import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  addAttachments,
  removeAttachment,
} from '../controllers/taskController.js';
import {
  handleUploadError,
  uploadTaskAttachments,
} from '../middlewares/upload.js';

const router = express.Router();

router.use(authenticateToken);

// Task routes
router.post('/', createTask);
router.get('/', getTasks);
router.get('/:taskId', getTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
router.post(
  '/:taskId/attachments',
  handleUploadError,
  uploadTaskAttachments,
  addAttachments
);
router.delete('/:taskId/attachments/:attachmentId', removeAttachment);

// Comments
router.post('/:taskId/comments', addComment);

export default router;
