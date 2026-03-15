const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Slider = sequelize.define('Slider', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  link: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  buttonText: {
    type: DataTypes.STRING(50),
    defaultValue: 'Xem ngay'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sliders',
  timestamps: true,
  underscored: true
});

module.exports = Slider;