const notFound = (req, res, next) => {
  res.status(404);
  return next(new Error(`Not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? err.statusCode || 500 : res.statusCode;
  let message = err.message || "Server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "User with this email already exists";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large. Max file size is 5MB";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
