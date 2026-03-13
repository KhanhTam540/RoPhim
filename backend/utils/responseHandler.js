/**
 * Format response thành công
 */
const successResponse = (res, data = null, message = 'Thành công', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Format response với phân trang
 */
const paginationResponse = (res, data, pagination, message = 'Thành công') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

/**
 * Format response lỗi
 */
const errorResponse = (res, message = 'Lỗi server', statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  successResponse,
  paginationResponse,
  errorResponse
};