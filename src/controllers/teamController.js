import Team from '../models/Team.js';
import User from '../models/User.js';

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = new Team({
      name,
      description,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'leader',
        },
      ],
    });

    await team.save();

    // Update user's teamRoles
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        teamRoles: {
          teamId: team._id,
          role: 'leader',
        },
      },
    });

    res.status(201).json({
      message: 'Team created successfully',
      team: await team.populate('members.user', 'name email'),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating team',
      error: error.message,
    });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id,
    })
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    res.json({ teams });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching teams',
      error: error.message,
    });
  }
};

export const getTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.teamId,
      'members.user': req.user._id,
    })
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ team });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching team',
      error: error.message,
    });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
        'members.user': req.user._id,
        'members.role': 'leader',
      },
      {
        $set: {
          name,
          description,
          updatedAt: Date.now(),
        },
      },
      { new: true }
    )
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    if (!team) {
      return res
        .status(404)
        .json({ message: 'Team not found or unauthorized' });
    }

    res.json({
      message: 'Team updated successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating team',
      error: error.message,
    });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.teamId,
      'members.user': req.user._id,
      'members.role': 'leader',
    });

    if (!team) {
      return res
        .status(404)
        .json({ message: 'Team not found or unauthorized' });
    }

    // Remove team roles from all team members
    await User.updateMany(
      { 'teamRoles.teamId': team._id },
      { $pull: { teamRoles: { teamId: team._id } } }
    );

    // Delete the team
    await Team.deleteOne({ _id: team._id });

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting team',
      error: error.message,
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add member to team
    const team = await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
        'members.user': req.user._id,
        'members.role': 'leader',
        'members.user': { $ne: userId },
      },
      {
        $push: {
          members: {
            user: userId,
            role,
          },
        },
      },
      { new: true }
    )
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    if (!team) {
      return res
        .status(404)
        .json({ message: 'Team not found or unauthorized' });
    }

    // Update user's teamRoles
    await User.findByIdAndUpdate(userId, {
      $push: {
        teamRoles: {
          teamId: team._id,
          role,
        },
      },
    });

    res.json({
      message: 'Team member added successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding team member',
      error: error.message,
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const team = await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
        'members.user': req.user._id,
        'members.role': 'leader',
      },
      {
        $pull: {
          members: {
            user: userId,
          },
        },
      },
      { new: true }
    )
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    if (!team) {
      return res
        .status(404)
        .json({ message: 'Team not found or unauthorized' });
    }

    // Remove team role from user
    await User.findByIdAndUpdate(userId, {
      $pull: {
        teamRoles: {
          teamId: team._id,
        },
      },
    });

    res.json({
      message: 'Team member removed successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error removing team member',
      error: error.message,
    });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const team = await Team.findOneAndUpdate(
      {
        _id: req.params.teamId,
        'members.user': req.user._id,
        'members.role': 'leader',
      },
      {
        $set: {
          'members.$.role': role,
        },
      },
      { new: true }
    )
      .populate('members.user', 'name email')
      .populate('createdBy', 'name email');

    if (!team) {
      return res
        .status(404)
        .json({ message: 'Team not found or unauthorized' });
    }

    // Update user's team role
    await User.findOneAndUpdate(
      {
        _id: userId,
        'teamRoles.teamId': team._id,
      },
      {
        $set: {
          'teamRoles.$.role': role,
        },
      }
    );

    res.json({
      message: 'Member role updated successfully',
      team,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating member role',
      error: error.message,
    });
  }
};
