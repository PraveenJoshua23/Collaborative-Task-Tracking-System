export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

export const checkTeamRole = (teamRole) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const teamId = req.params.teamId || req.body.teamId;
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    const userTeamRole = req.user.teamRoles.find(
      (role) => role.teamId.toString() === teamId
    );

    if (!userTeamRole || userTeamRole.role !== teamRole) {
      return res.status(403).json({
        message: 'You do not have required team role to perform this action',
      });
    }

    next();
  };
};
