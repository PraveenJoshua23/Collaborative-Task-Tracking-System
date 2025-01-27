import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Only allow admin role to be set by existing admins
    const userRole = role === 'admin' ? 'team_member' : role || 'team_member';

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role: userRole,
    });

    await user.save();

    // Generate JWT token with role information
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        teamRoles: user.teamRoles,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with role information
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        teamRoles: user.teamRoles,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
