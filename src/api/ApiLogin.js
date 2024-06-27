const ApiLoginSuccess = (status_code, status, email, token, message, res) => {
  res.status(status_code).json({
    status_code: status_code,
    status: status,
    email: email,
    token: token,
    message: message,
  });
};

const ApiLoginFailed = (status_code, status, message, res) => {
  res.status(status_code).json({
    status_code: status_code,
    status: status,
    message: message,
  });
};

module.exports = { ApiLoginSuccess, ApiLoginFailed };
