const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  
  // Multer errors (like size limit)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum limit is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Handle mongoose validation/cast errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map(val => val.message).join(', ')
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID: ${err.value}`
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = errorMiddleware;
