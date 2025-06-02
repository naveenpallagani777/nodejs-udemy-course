const e = require('express');
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        director: {
            type: String,
            required: true,
            trim: true,
        },
        releaseYear: {
            type: Number,
            required: true,
            validate:{
                validator: function (val) {
                    return val >= 1888 && val <= new Date().getFullYear(); // First movie was made in 1888
                },
                message: props => `${props.value} is not a valid release year!`
            }
        },
        genre: {
            type: [String],
            required: true,
            enum: {
                values: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance'],
                message: '{VALUE} is not a valid genre',
            },
        },
        rating: {
            type: Number,
            min: 0,
            max: 10,
        },
        durationMinutes: {
            type: Number,
        },
        posterUrl: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

movieSchema.virtual('durationHours').get(function () {
    return Math.floor(this.durationMinutes / 60);
});

// 1) document middleware to set the createdAt field

// movieSchema.pre('save', function (next) {
//     this.name = this.name.trim();
//     next();
// });

// 2) query middleware to filter out movies with a rating less than 5

// movieSchema.pre('find', function () {
//     this.where({ rating: { $gte: 5 } });
// });

// 3) aggregation middleware to add a field with the average rating of all movies

// movieSchema.pre('aggregate', function (next) {
//     console.log('Aggregation middleware triggered');
//     next();
// });

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
