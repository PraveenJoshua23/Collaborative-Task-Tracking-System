import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Destination called');
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    console.log('Filename called');
    console.log('Original file:', file);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('Received file:', file);
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(
      'Invalid file type. Only JPEG, PNG and GIF allowed.'
    );
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  cb(null, true);
};

// Configure upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Error handler middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res
      .status(400)
      .json({ message: 'File upload error.', error: err.message });
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ message: err.message });
  }

  next(err);
};

export const uploadAvatarMiddleware = upload.single('avatar');
