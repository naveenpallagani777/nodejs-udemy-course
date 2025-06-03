const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const dotenv = require('dotenv');
const moviesRoutes = require('./routes/movieRoutes');
const userRoutes = require('./routes/userRoutes');
const APIError = require('./utils/appError');
const { gobalErrorHandler } = require('./controllers/errorController');
dotenv.config();

const app = express();
app.use(express.json());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

app.get('/', (req, res) => {
	res.send('Welcome to the Movie API');
});

app.use('/api/movies', moviesRoutes);
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
	next(new APIError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(gobalErrorHandler);

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log('Connected to MongoDB');
		app.listen(process.env.PORT || 3000, () => {
			console.log(`Server is running on port http://localhost:${process.env.PORT || 3000}`);
		});
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error.message);
	});

// Handle uncaught exceptions and unhandled rejections
process.on('unhandledRejection', (error) => {
	console.error('Unhandled Rejection:', error.name, error.message);
	server.close(() => {
		process.exit(1);
	});
});

process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error.name, error.message);
	server.close(() => {
		process.exit(1);
	});
});