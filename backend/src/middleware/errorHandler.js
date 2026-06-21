function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
}

module.exports = { notFound, errorHandler };
