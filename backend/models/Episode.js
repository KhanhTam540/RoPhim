const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Episode = sequelize.define('Episode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  episodeNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255)
  },
  description: {
    type: DataTypes.TEXT
  },
  duration: {
    type: DataTypes.INTEGER,
    comment: 'Thời lượng tập (phút)'
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING(255)
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  releaseDate: {
    type: DataTypes.DATEONLY
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'episodes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['movie_id', 'episode_number']
    }
  ]
});

module.exports = Episode;