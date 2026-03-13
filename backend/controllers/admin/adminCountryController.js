const { Country, Movie } = require('../../models');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { getPagination } = require('../../utils/helpers');
const { Op } = require('sequelize');

// Lấy danh sách quốc gia
const getAllCountries = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};
  
  if (req.query.search) {
    where.name = { [Op.like]: `%${req.query.search}%` };
  }

  const { count, rows: countries } = await Country.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset
  });

  const pagination = getPagination(page, limit, count);

  successResponse(res, {
    countries,
    pagination
  });
});

// Lấy chi tiết quốc gia
const getCountryById = catchAsync(async (req, res, next) => {
  const { countryId } = req.params;

  const country = await Country.findByPk(countryId);
  if (!country) {
    return next(new AppError('Không tìm thấy quốc gia', 404));
  }

  successResponse(res, { country });
});

// Tạo quốc gia mới
const createCountry = catchAsync(async (req, res, next) => {
  const { name, code, flag } = req.body;

  // Kiểm tra code đã tồn tại
  const existing = await Country.findOne({ 
    where: { 
      [Op.or]: [{ name }, { code }] 
    } 
  });

  if (existing) {
    if (existing.name === name) {
      return next(new AppError('Tên quốc gia đã tồn tại', 400));
    }
    if (existing.code === code) {
      return next(new AppError('Mã quốc gia đã tồn tại', 400));
    }
  }

  const country = await Country.create({
    name,
    code,
    flag
  });

  successResponse(res, { country }, 'Tạo quốc gia thành công', 201);
});

// Cập nhật quốc gia
const updateCountry = catchAsync(async (req, res, next) => {
  const { countryId } = req.params;
  const updateData = req.body;

  const country = await Country.findByPk(countryId);
  if (!country) {
    return next(new AppError('Không tìm thấy quốc gia', 404));
  }

  await country.update(updateData);

  successResponse(res, { country }, 'Cập nhật quốc gia thành công');
});

// Xóa quốc gia
const deleteCountry = catchAsync(async (req, res, next) => {
  const { countryId } = req.params;

  const country = await Country.findByPk(countryId);
  if (!country) {
    return next(new AppError('Không tìm thấy quốc gia', 404));
  }

  // Kiểm tra quốc gia có đang được sử dụng không
  const movieCount = await country.countMovies();
  if (movieCount > 0) {
    return next(new AppError('Không thể xóa vì quốc gia đang có phim', 400));
  }

  await country.destroy();

  successResponse(res, null, 'Xóa quốc gia thành công');
});

// Kích hoạt/ vô hiệu hóa quốc gia
const toggleCountryStatus = catchAsync(async (req, res, next) => {
  const { countryId } = req.params;
  const { isActive } = req.body;

  const country = await Country.findByPk(countryId);
  if (!country) {
    return next(new AppError('Không tìm thấy quốc gia', 404));
  }

  country.isActive = isActive;
  await country.save();

  successResponse(res, { country }, isActive ? 'Đã kích hoạt quốc gia' : 'Đã vô hiệu hóa quốc gia');
});

module.exports = {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  toggleCountryStatus
};