const ApiProduct = (status_code, status, data, message, res) => {
  res.status(status_code).json({
    status_code: status_code,
    status: status,
    data: data,
    message: message,
  });
};

module.exports = ApiProduct;
