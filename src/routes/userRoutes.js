const router  = require('express').Router();
const { signup, login, forgotPassword, resetPassword, updatePassword } = require('../controllers/authControllers');
const { protectMiddleware } = require('../middleware/protectMiddleware');

// authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protectMiddleware); 
router.patch('/updtate-password', updatePassword);

// user profile routes


module.exports = router;