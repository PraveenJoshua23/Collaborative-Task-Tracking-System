import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });

      // Fetch complete user data including roles
      const user = await User.findById(decoded.userId)
        .select('-password')
        .lean();

      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
