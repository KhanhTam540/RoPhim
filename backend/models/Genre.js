const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('../utils/slugify');

const Genre = sequelize.define('Genre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(100),
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  icon: {
    type: DataTypes.STRING(255)
  },
  is_active: {  // QUAN TRỌNG: dùng is_active, không phải isActive
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  meta_title: {
    type: DataTypes.STRING(255)
  },
  meta_description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'genres',
  timestamps: true,
  underscored: true,  // QUAN TRỌNG: tự động chuyển camelCase thành underscored
  hooks: {
    beforeCreate: async (genre) => {
      if (genre.name && !genre.slug) {
        genre.slug = slugify(genre.name);
      }
    },
    beforeUpdate: async (genre) => {
      if (genre.changed('name')) {
        genre.slug = slugify(genre.name);
      }
    }
  }
});

module.exports = Genre;