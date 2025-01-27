import Task from '../models/Task.js';
import Team from '../models/Team.js';
import { uploadFile } from '../middlewares/upload.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, teamId, assignedTo, priority } =
      req.body;

    // Verify team membership
    const team = await Team.findOne({
      _id: teamId,
      'members.user': req.user._id,
    });

    if (!team) {
      return res
        .status(404)
        .json({ message: 'Team not found or unauthorized' });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      team: teamId,
      createdBy: req.user._id,
      assignedTo,
      priority,
    });

    await task.save();

    const populatedTask = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating task',
      error: error.message,
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { status, priority, teamId, assignedTo, search, startDate, endDate } =
      req.query;

    // Base query - tasks from teams user is member of
    const query = {
      team: { $in: req.user.teamRoles.map((role) => role.teamId) },
    };

    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (teamId) query.team = teamId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('team', 'name')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      team: { $in: req.user.teamRoles.map((role) => role.teamId) },
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('team', 'name')
      .populate('comments.author', 'name email');

    if (!task) {
      return res
        .status(404)
        .json({ message: 'Task not found or unauthorized' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching task',
      error: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignedTo, priority } =
      req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        team: { $in: req.user.teamRoles.map((role) => role.teamId) },
      },
      {
        $set: {
          title,
          description,
          status,
          dueDate,
          assignedTo,
          priority,
          updatedAt: Date.now(),
        },
      },
      { new: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('team', 'name');

    if (!task) {
      return res
        .status(404)
        .json({ message: 'Task not found or unauthorized' });
    }

    res.json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating task',
      error: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      team: { $in: req.user.teamRoles.map((role) => role.teamId) },
    });

    if (!task) {
      return res
        .status(404)
        .json({ message: 'Task not found or unauthorized' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting task',
      error: error.message,
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        team: { $in: req.user.teamRoles.map((role) => role.teamId) },
      },
      {
        $push: {
          comments: {
            content,
            author: req.user._id,
          },
        },
      },
      { new: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('team', 'name')
      .populate('comments.author', 'name email');

    if (!task) {
      return res
        .status(404)
        .json({ message: 'Task not found or unauthorized' });
    }

    res.json({
      message: 'Comment added successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding comment',
      error: error.message,
    });
  }
};

export const addAttachments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      path: file.path,
      uploadedAt: new Date(),
    }));

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        team: { $in: req.user.teamRoles.map((role) => role.teamId) },
      },
      {
        $push: {
          attachments: { $each: attachments },
        },
      },
      { new: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('team', 'name')
      .populate('comments.author', 'name email');

    if (!task) {
      // Delete uploaded files if task not found
      await Promise.all(
        req.files.map((file) =>
          fs
            .unlink(file.path)
            .catch((err) => console.error('Error deleting file:', err))
        )
      );
      return res
        .status(404)
        .json({ message: 'Task not found or unauthorized' });
    }

    res.json({
      message: 'Attachments added successfully',
      task,
    });
  } catch (error) {
    // Delete uploaded files on error
    if (req.files) {
      await Promise.all(
        req.files.map((file) =>
          fs
            .unlink(file.path)
            .catch((err) => console.error('Error deleting file:', err))
        )
      );
    }
    res.status(500).json({
      message: 'Error adding attachments',
      error: error.message,
    });
  }
};

export const removeAttachment = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      team: { $in: req.user.teamRoles.map((role) => role.teamId) },
    });

    if (!task) {
      return res
        .status(404)
        .json({ message: 'Task not found or unauthorized' });
    }

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Remove file from filesystem
    await fs
      .unlink(attachment.path)
      .catch((err) => console.error('Error deleting file:', err));

    // Remove attachment from task
    task.attachments.pull(req.params.attachmentId);
    await task.save();

    const updatedTask = await task
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('team', 'name')
      .populate('comments.author', 'name email');

    res.json({
      message: 'Attachment removed successfully',
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error removing attachment',
      error: error.message,
    });
  }
};
