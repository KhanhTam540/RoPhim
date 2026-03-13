const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('../utils/slugify');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    unique: true
  },
  originalTitle: {
    type: DataTypes.STRING(255)
  },
  description: {
    type: DataTypes.TEXT
  },
  poster: {
    type: DataTypes.STRING(255)
  },
  backdrop: {
    type: DataTypes.STRING(255)
  },
  releaseYear: {
    type: DataTypes.INTEGER
  },
  duration: {
    type: DataTypes.INTEGER,
    comment: 'Thời lượng phim (phút)'
  },
  type: {
    type: DataTypes.ENUM('single', 'series'),
    defaultValue: 'single'
  },
  status: {
    type: DataTypes.ENUM('ongoing', 'completed', 'upcoming'),
    defaultValue: 'ongoing'
  },
  quality: {
    type: DataTypes.STRING(50)
  },
  language: {
    type: DataTypes.STRING(50)
  },
  subtitle: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ratingAverage: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  trailerUrl: {
    type: DataTypes.STRING(500)
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    comment: 'URL video cho phim lẻ'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metaTitle: {
    type: DataTypes.STRING(255)
  },
  metaDescription: {
    type: DataTypes.TEXT
  },
  metaKeywords: {
    type: DataTypes.STRING(500)
  },
  createdBy: {
    type: DataTypes.INTEGER
  },
  updatedBy: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'movies',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (movie) => {
      if (movie.title && !movie.slug) {
        movie.slug = slugify(movie.title);
      }
    },
    beforeUpdate: async (movie) => {
      if (movie.changed('title')) {
        movie.slug = slugify(movie.title);
      }
    }
  }
});

module.exports = Movie;