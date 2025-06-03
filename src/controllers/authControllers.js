const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const User = require('../modules/userModel');
const { catchAsync } = require('../utils/catchAsync');
const APPError = require('../utils/appError');
const sendEmail = require('../utils/email');

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  if (!newUser) {
    return next(new APPError('User creation failed', 400));
  }

  const userObj = newUser.toObject();
  delete userObj.password;

  res.status(201).json({
    status: 'success',
    data: { user: userObj },
    token: generateToken(newUser),
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new APPError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new APPError('Incorrect email or password', 401));
  }

  const userObj = user.toObject();
  delete userObj.password;

  res.status(200).json({
    status: 'success',
    data: { user: userObj },
    token: generateToken(user),
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new APPError('Please provide your email', 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new APPError('No user found with this email', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/user/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message,
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new APPError('There was an error sending the email. Try again later!', 500));
    }

    res.status(200).json({
        status: 'success',
        message: `Token sent to ${user.email}. Please check your email.`,
    });
});


exports.resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
        return next(new APPError('Please provide token, password and confirm password', 400));
    }

    if (password !== confirmPassword) {
        return next(new APPError('Passwords do not match', 400));
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ 
        passwordResetToken: hashedToken, 
        passwordResetExpires: { $gt: Date.now() } 
    });
    if (!user) {
        return next(new APPError('Invalid or expired reset token', 400));
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Ensure the password changed time is set to now minus 1 second
    user.passwordChangedAt = Date.now() - 1000; 
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
        status: 'success',
        data: { user: userObj },
        token: generateToken(user),
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new APPError('Please provide current password, new password and confirm new password', 400));
    }

    if (newPassword !== confirmNewPassword) {
        return next(new APPError('New passwords do not match', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.correctPassword(currentPassword, user.password))) {
        return next(new APPError('Current password is incorrect', 401));
    }
    
    user.password = newPassword;
    user.passwordChangedAt = Date.now() - 1000;
    user.save();

    const userObj = user.toObject();
    delete userObj.password;
    

    res.status(200).json({
        status: 'success',
        data: { user: userObj },
        token: generateToken(user),
    });
});
