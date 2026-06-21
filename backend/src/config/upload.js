const path = require('path');
const fs = require('fs');
const multer = require('multer');

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 8);
const reportsUploadDir = path.join(process.cwd(), 'uploads', 'reports');

fs.mkdirSync(reportsUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reportsUploadDir);
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
    const error = new Error('Only JPG, PNG, and WEBP images are allowed');
    error.statusCode = 400;
    return cb(error);
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
