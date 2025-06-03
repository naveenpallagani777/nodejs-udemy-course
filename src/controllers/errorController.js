const APPError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    return new APPError(`Invalid ${err.path}: ${err.value}`, 400);
}

const handleValidationErrorDB = (err) => {
    return new APPError(`Invalid input data: ${Object.values(err.errors).map(el => el.message).join('. ')}`, 400);
}

const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return new APPError(`Duplicate field value: ${field} = ${value}. Please use another value!`, 400);
};

const handleJWTError = () => new APPError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new APPError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => (
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    })
);

const sendErrorProd = (err, res) => err.isOperational ?
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    }) :
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
    });

exports.gobalErrorHandler = (err, req, res, next) => {

    if (err.name === "CastError") err = handleCastErrorDB(err);
    else if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
    else if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    else if (err.name === 'JsonWebTokenError') err = handleJWTError();
    else if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    switch (process.env.NODE_ENV) {
        case 'development':
            return sendErrorDev(err, res);
        case 'production':
            return sendErrorProd(err, res);
        default:
            // Fallback: generic error response
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message || 'Unknown error occurred',
            });
    }
}
