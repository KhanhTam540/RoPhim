const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('../utils/slugify');

const Country = sequelize.define('Country', {
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
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(100),
    unique: true
  },
  flag: {
    type: DataTypes.STRING(255)
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'countries',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (country) => {
      if (country.name && !country.slug) {
        country.slug = slugify(country.name);
      }
    },
    beforeUpdate: async (country) => {
      if (country.changed('name')) {
        country.slug = slugify(country.name);
      }
    }
  }
});

module.exports = Country;