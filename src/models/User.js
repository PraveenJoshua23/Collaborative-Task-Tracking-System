import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'team_leader', 'team_member', 'viewer'],
    default: 'team_member',
  },
  teamRoles: [
    {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
      role: {
        type: String,
        enum: ['leader', 'member', 'viewer'],
        default: 'member',
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: null,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
