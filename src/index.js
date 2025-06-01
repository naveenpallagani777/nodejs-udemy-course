const express = require('express');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
const moviesRoutes = require('./routes/movieRoutes');
dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Welcome to the Movie API');
});

app.use('/api/movies', moviesRoutes);

mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log('Connected to MongoDB');
	app.listen(process.env.PORT || 3000, () => {
		console.log(`Server is running on port ${process.env.PORT || 3000}`);
	});
}).catch((error) => {
	console.error('Error connecting to MongoDB:', error.message);
});
