const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('../utils/slugify');

const Actor = sequelize.define('Actor', {
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
  tableName: 'actors',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (actor) => {
      if (actor.name && !actor.slug) {
        actor.slug = slugify(actor.name);
      }
    },
    beforeUpdate: async (actor) => {
      if (actor.changed('name')) {
        actor.slug = slugify(actor.name);
      }
    }
  }
});

module.exports = Actor;