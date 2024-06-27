const ApiError = (status_code, status, message, error, res) => {
  res.status(status_code).json({
    status_code: status_code,
    status: status,
    message: message,
    error: error,
  });
};

module.exports = ApiError;
