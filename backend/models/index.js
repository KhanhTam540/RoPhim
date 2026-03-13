const { sequelize } = require('../config/database');
const User = require('./User');
const Movie = require('./Movie');
const Genre = require('./Genre');
const Country = require('./Country');
const Actor = require('./Actor');
const Director = require('./Director');
const Episode = require('./Episode');
const Rating = require('./Rating');
const Comment = require('./Comment');
const CommentLike = require('./CommentLike');
const Favorite = require('./Favorite');
const History = require('./History');
const Slider = require('./Slider');

// User relationships
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
User.hasMany(History, { foreignKey: 'userId', as: 'histories' });

// Movie relationships
Movie.belongsToMany(Genre, { 
  through: 'MovieGenres', 
  as: 'genres',
  foreignKey: 'movieId',
  otherKey: 'genreId'
});
Movie.belongsToMany(Country, { 
  through: 'MovieCountries', 
  as: 'countries',
  foreignKey: 'movieId',
  otherKey: 'countryId'
});
Movie.belongsToMany(Actor, { 
  through: 'MovieActors', 
  as: 'actors',
  foreignKey: 'movieId',
  otherKey: 'actorId'
});
Movie.belongsToMany(Director, { 
  through: 'MovieDirectors', 
  as: 'directors',
  foreignKey: 'movieId',
  otherKey: 'directorId'
});
Movie.hasMany(Episode, { foreignKey: 'movieId', as: 'episodes' });
Movie.hasMany(Rating, { foreignKey: 'movieId', as: 'ratings' });
Movie.hasMany(Comment, { foreignKey: 'movieId', as: 'comments' });
Movie.hasMany(Favorite, { foreignKey: 'movieId', as: 'favorites' });
Movie.hasMany(History, { foreignKey: 'movieId', as: 'histories' });

// Episode relationships
Episode.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

// Rating relationships
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Rating.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

// Comment relationships
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });
Comment.hasMany(CommentLike, { foreignKey: 'commentId', as: 'likes' });

// CommentLike relationships
CommentLike.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });
CommentLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Favorite relationships
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Favorite.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

// History relationships
History.belongsTo(User, { foreignKey: 'userId', as: 'user' });
History.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });
History.belongsTo(Episode, { foreignKey: 'episodeId', as: 'episode' });

// Slider relationships
Slider.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

module.exports = {
  sequelize,
  User,
  Movie,
  Genre,
  Country,
  Actor,
  Director,
  Episode,
  Rating,
  Comment,
  CommentLike,
  Favorite,
  History,
  Slider
};