const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const dotenv = require('dotenv');
dotenv.config();

const { catchAsync } = require('../utils/catchAsync');
const APPError = require('../utils/appError');
const User = require('../modules/userModel');

exports.protectMiddleware = catchAsync(async (req, res, next) => {
    
    // Check if the request has an Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new APPError('You are not logged in! Please log in to get access.', 401));
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    // Check if the user still exists and if the password has been changed after the token was issued
    if (!currentUser) {
        return next(new APPError('The user belonging to this token does no longer exist.', 401));
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new APPError('User recently changed password! Please log in again.', 401));
    }

    // Grant access to the protected route
    req.user = currentUser;
    next();
});