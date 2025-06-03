const APPError = require('../utils/appError');

const restrictToMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new APPError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

module.exports = restrictToMiddleware;