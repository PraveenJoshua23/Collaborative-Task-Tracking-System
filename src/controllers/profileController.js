import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { name, email } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating profile', error: error.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting profile', error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Find user and update password
    const updatedUser = await User.findById(req.user.userId);
    updatedUser.password = newPassword;
    await updatedUser.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error changing password', error: error.message });
  }
};

export const getActivity = async (req, res) => {
  try {
    // Implementation depends on how you track user activity
    // This is a placeholder that returns empty activity
    res.json({ activities: [] });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching activity', error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    console.log('Request received:', req.file); // Log the file object
    console.log('Request body:', req.body);
    // Assuming you'll implement file upload middleware like multer
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { avatar: req.file.path } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Avatar uploaded successfully', user });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error uploading avatar', error: error.message });
  }
};
