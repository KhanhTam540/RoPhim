const { Country } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { successResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

// Lấy danh sách quốc gia
const getCountries = catchAsync(async (req, res) => {
  const countries = await Country.findAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'code', 'slug', 'flag'],
    order: [['name', 'ASC']]
  });

  successResponse(res, { countries });
});

// Lấy chi tiết quốc gia theo slug
const getCountryBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const country = await Country.findOne({
    where: { slug, isActive: true }
  });

  if (!country) {
    return next(new AppError('Không tìm thấy quốc gia', 404));
  }

  successResponse(res, { country });
});

module.exports = {
  getCountries,
  getCountryBySlug
};