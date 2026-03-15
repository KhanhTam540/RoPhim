const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
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

// ==================== ĐỊNH NGHĨA JUNCTION MODELS ====================

// MovieGenre Junction Model
const MovieGenre = sequelize.define('MovieGenre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  genre_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'genres',
      key: 'id'
    }
  }
}, {
  tableName: 'movie_genres',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['movie_id', 'genre_id']
    }
  ]
});

// MovieCountry Junction Model
const MovieCountry = sequelize.define('MovieCountry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'countries',
      key: 'id'
    }
  }
}, {
  tableName: 'movie_countries',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['movie_id', 'country_id']
    }
  ]
});

// MovieActor Junction Model
const MovieActor = sequelize.define('MovieActor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  actor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'actors',
      key: 'id'
    }
  }
}, {
  tableName: 'movie_actors',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['movie_id', 'actor_id']
    }
  ]
});

// MovieDirector Junction Model
const MovieDirector = sequelize.define('MovieDirector', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  director_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'directors',
      key: 'id'
    }
  }
}, {
  tableName: 'movie_directors',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['movie_id', 'director_id']
    }
  ]
});

// Log để kiểm tra
console.log('📦 Models loaded:', {
  User: !!User,
  Movie: !!Movie,
  Genre: !!Genre,
  Country: !!Country,
  Actor: !!Actor,
  Director: !!Director,
  Episode: !!Episode,
  Rating: !!Rating,
  Comment: !!Comment,
  CommentLike: !!CommentLike,
  Favorite: !!Favorite,
  History: !!History,
  Slider: !!Slider,
  MovieGenre: !!MovieGenre,
  MovieCountry: !!MovieCountry,
  MovieActor: !!MovieActor,
  MovieDirector: !!MovieDirector
});

// ==================== USER RELATIONSHIPS ====================
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings', onDelete: 'CASCADE' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments', onDelete: 'CASCADE' });
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites', onDelete: 'CASCADE' });
User.hasMany(History, { foreignKey: 'user_id', as: 'histories', onDelete: 'CASCADE' });

// ==================== MOVIE RELATIONSHIPS ====================
Movie.belongsToMany(Genre, { 
  through: MovieGenre,  // SỬA: dùng model thay vì string
  as: 'genres',
  foreignKey: 'movie_id',
  otherKey: 'genre_id'
});

Movie.belongsToMany(Country, { 
  through: MovieCountry,  // SỬA: dùng model thay vì string
  as: 'countries',
  foreignKey: 'movie_id',
  otherKey: 'country_id'
});

Movie.belongsToMany(Actor, { 
  through: MovieActor,  // SỬA: dùng model thay vì string
  as: 'actors',
  foreignKey: 'movie_id',
  otherKey: 'actor_id'
});

Movie.belongsToMany(Director, { 
  through: MovieDirector,  // SỬA: dùng model thay vì string
  as: 'directors',
  foreignKey: 'movie_id',
  otherKey: 'director_id'
});

Movie.hasMany(Episode, { foreignKey: 'movie_id', as: 'episodes', onDelete: 'CASCADE' });
Movie.hasMany(Rating, { foreignKey: 'movie_id', as: 'ratings', onDelete: 'CASCADE' });
Movie.hasMany(Comment, { foreignKey: 'movie_id', as: 'comments', onDelete: 'CASCADE' });
Movie.hasMany(Favorite, { foreignKey: 'movie_id', as: 'favorites', onDelete: 'CASCADE' });
Movie.hasMany(History, { foreignKey: 'movie_id', as: 'histories', onDelete: 'CASCADE' });

// ==================== GENRE RELATIONSHIPS ====================
Genre.belongsToMany(Movie, { 
  through: MovieGenre,  // SỬA: dùng model thay vì string
  as: 'movies',
  foreignKey: 'genre_id',
  otherKey: 'movie_id'
});

// ==================== COUNTRY RELATIONSHIPS ====================
Country.belongsToMany(Movie, { 
  through: MovieCountry,  // SỬA: dùng model thay vì string
  as: 'movies',
  foreignKey: 'country_id',
  otherKey: 'movie_id'
});

// ==================== ACTOR RELATIONSHIPS ====================
Actor.belongsToMany(Movie, { 
  through: MovieActor,  // SỬA: dùng model thay vì string
  as: 'movies',
  foreignKey: 'actor_id',
  otherKey: 'movie_id'
});

// ==================== DIRECTOR RELATIONSHIPS ====================
Director.belongsToMany(Movie, { 
  through: MovieDirector,  // SỬA: dùng model thay vì string
  as: 'movies',
  foreignKey: 'director_id',
  otherKey: 'movie_id'
});

// ==================== EPISODE RELATIONSHIPS ====================
Episode.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie', onDelete: 'CASCADE' });

// ==================== RATING RELATIONSHIPS ====================
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
Rating.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie', onDelete: 'CASCADE' });

// ==================== COMMENT RELATIONSHIPS ====================
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
Comment.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie', onDelete: 'CASCADE' });
Comment.hasMany(CommentLike, { foreignKey: 'comment_id', as: 'likes', onDelete: 'CASCADE' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent', onDelete: 'CASCADE' });
Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies', onDelete: 'CASCADE' });

// ==================== COMMENT LIKE RELATIONSHIPS ====================
CommentLike.belongsTo(Comment, { foreignKey: 'comment_id', as: 'comment', onDelete: 'CASCADE' });
CommentLike.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

// ==================== FAVORITE RELATIONSHIPS ====================
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
Favorite.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie', onDelete: 'CASCADE' });

// ==================== HISTORY RELATIONSHIPS ====================
History.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
History.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie', onDelete: 'CASCADE' });
History.belongsTo(Episode, { foreignKey: 'episode_id', as: 'episode', onDelete: 'CASCADE' });

// ==================== SLIDER RELATIONSHIPS ====================
Slider.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie', onDelete: 'SET NULL' });

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
  Slider,
  MovieGenre,
  MovieCountry,
  MovieActor,
  MovieDirector
};