const Movie = require('../modules/movieModel');
const qs = require('qs');
const apiFeatures = require('../utils/apiFeatures');

exports.getAll = async (req, res) => {
    try {

        // Parse the query string
        const rawQuery = qs.parse(req._parsedUrl.query);

        const apiFeature = new apiFeatures(Movie.find(), rawQuery, await Movie.countDocuments())
            .filter()
            .sort()
            .limitFields()
            .paginate();
        
        const movies = await apiFeature.query;

        res.status(200).json({
            status: 'success',
            results: movies.length,
            data: {
                movies,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching movies',
            error: error.message,
        });
    }
}

exports.getById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({
                status: 'fail',
                message: 'Movie not found',
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                movie,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: 'An error occurred while fetching the movie',
        });
    }
}

exports.create = async (req, res) => {
    try {
        const newMovie = await Movie.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { movie: newMovie },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'An error occurred while creating the movie',
            error: error.message,
        });
    }
};


exports.update = async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedMovie) {
            return res.status(404).json({
                status: 'fail',
                message: 'Movie not found',
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                movie: updatedMovie,
            },
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'An error occurred while updating the movie',
            error: error.message,
        });
    }
}

exports.remove = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({
                status: 'fail',
                message: 'Movie not found',
            });
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while deleting the movie',
        });
    }
}

exports.getStatistics = async (req, res) => {
    try {
        const stats = await Movie.aggregate([
            {
                $match: {
                    rating: { $gte: 8 },
                },
            },
            {
                $group: {
                    _id: null,
                    totalMovies: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    highestRatedMovie: { $max: '$rating' },
                    lowestRatedMovie: { $min: '$rating' },
                },
            },
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                statistics: stats[0],
            },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching statistics',
            error: error.message,
        });
    }
}