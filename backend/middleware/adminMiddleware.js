const AppError = require('../utils/AppError');

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new AppError('Yêu cầu quyền admin', 403));
  }
};

/**
 * Check if user is admin or self
 */
const isAdminOrSelf = (req, res, next) => {
  const userId = parseInt(req.params.userId) || parseInt(req.params.id);
  
  if (req.user && (req.user.role === 'admin' || req.user.id === userId)) {
    next();
  } else {
    return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
  }
};

module.exports = {
  isAdmin,
  isAdminOrSelf
};