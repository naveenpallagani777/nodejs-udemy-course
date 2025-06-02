const Movie = require('../modules/movieModel');
const qs = require('qs');
const apiFeatures = require('../utils/apiFeatures');
const APPError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

exports.getAll = catchAsync(async (req, res, next) => {
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

});

exports.getById = catchAsync(async (req, res, next) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return next(new APPError(`No movie found with ID ${req.params.id}`, 404));
    res.status(200).json({
        status: 'success',
        data: {
            movie,
        },
    });

});

exports.create = catchAsync(async (req, res, next) => {
    const newMovie = await Movie.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { movie: newMovie },
    });

});


exports.update = catchAsync(async (req, res, next) => {

    const updatedMovie = await Movie.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!updatedMovie) return next(new APPError(`No movie found with ID ${req.params.id}`, 404));
    res.status(200).json({
        status: 'success',
        data: {
            movie: updatedMovie,
        },
    });

});

exports.remove = catchAsync(async (req, res, next) => {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return next(new APPError(`No movie found with ID ${req.params.id}`, 404));

    res.status(204).json({
        status: 'success',
        data: null,
    });

});

exports.getStatistics = catchAsync(async (req, res, next) => {

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
})