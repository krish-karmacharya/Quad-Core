const path = require('path');
const multer = require('multer');

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 8);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'reports'));
  },
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '');

    cb(null, `${Date.now()}-${safeOriginalName}`);
  }
});

function fileFilter(req, file, cb) {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024
  }
});

module.exports = upload;
