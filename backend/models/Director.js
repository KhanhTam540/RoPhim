const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('../utils/slugify');

const Director = sequelize.define('Director', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    unique: true
  },
  originalName: {
    type: DataTypes.STRING(255)
  },
  bio: {
    type: DataTypes.TEXT
  },
  birthDate: {
    type: DataTypes.DATEONLY
  },
  deathDate: {
    type: DataTypes.DATEONLY
  },
  nationality: {
    type: DataTypes.STRING(100)
  },
  avatar: {
    type: DataTypes.STRING(255)
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'directors',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (director) => {
      if (director.name && !director.slug) {
        director.slug = slugify(director.name);
      }
    },
    beforeUpdate: async (director) => {
      if (director.changed('name')) {
        director.slug = slugify(director.name);
      }
    }
  }
});

module.exports = Director;