const ApiSuccess = (status_code, status, message, res) => {
  res.status(status_code).json({
    status_code: status_code,
    status: status,
    message: message,
  });
};

module.exports = ApiSuccess;
