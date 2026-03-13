const { Movie, User, Comment, Rating, History, sequelize } = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { Op } = require('sequelize');

// Thống kê tổng quan
const getOverview = catchAsync(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today.setDate(today.getDate() - 7));
  const startOfMonth = new Date(today.setMonth(today.getMonth() - 1));

  // Tổng số
  const totalMovies = await Movie.count();
  const totalUsers = await User.count();
  const totalComments = await Comment.count();
  const totalRatings = await Rating.count();

  // Tổng lượt xem
  const totalViewsResult = await Movie.sum('viewCount');
  const totalViews = totalViewsResult || 0;

  // Hôm nay
  const todayMovies = await Movie.count({
    where: { createdAt: { [Op.gte]: startOfDay } }
  });
  const todayUsers = await User.count({
    where: { createdAt: { [Op.gte]: startOfDay } }
  });
  const todayViews = await History.count({
    where: { watchedAt: { [Op.gte]: startOfDay } }
  });

  // 7 ngày qua
  const weekMovies = await Movie.count({
    where: { createdAt: { [Op.gte]: startOfWeek } }
  });
  const weekUsers = await User.count({
    where: { createdAt: { [Op.gte]: startOfWeek } }
  });
  const weekViews = await History.count({
    where: { watchedAt: { [Op.gte]: startOfWeek } }
  });

  // 30 ngày qua
  const monthMovies = await Movie.count({
    where: { createdAt: { [Op.gte]: startOfMonth } }
  });
  const monthUsers = await User.count({
    where: { createdAt: { [Op.gte]: startOfMonth } }
  });
  const monthViews = await History.count({
    where: { watchedAt: { [Op.gte]: startOfMonth } }
  });

  successResponse(res, {
    total: {
      movies: totalMovies,
      users: totalUsers,
      comments: totalComments,
      ratings: totalRatings,
      views: totalViews
    },
    today: {
      movies: todayMovies,
      users: todayUsers,
      views: todayViews
    },
    week: {
      movies: weekMovies,
      users: weekUsers,
      views: weekViews
    },
    month: {
      movies: monthMovies,
      users: monthUsers,
      views: monthViews
    }
  });
});

// Top phim xem nhiều
const getTopMovies = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const movies = await Movie.findAll({
    attributes: [
      'id', 'title', 'slug', 'poster', 'viewCount', 
      'ratingAverage', 'ratingCount', 'type'
    ],
    order: [['viewCount', 'DESC']],
    limit
  });

  successResponse(res, { movies });
});

// Top người dùng tích cực
const getTopUsers = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const users = await User.findAll({
    attributes: [
      'id', 'username', 'fullName', 'avatar', 'createdAt'
    ],
    include: [
      {
        model: Comment,
        as: 'comments',
        attributes: []
      },
      {
        model: Rating,
        as: 'ratings',
        attributes: []
      },
      {
        model: History,
        as: 'histories',
        attributes: []
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('comments.id')), 'commentCount'],
        [sequelize.fn('COUNT', sequelize.col('ratings.id')), 'ratingCount'],
        [sequelize.fn('COUNT', sequelize.col('histories.id')), 'viewCount']
      ]
    },
    group: ['User.id'],
    order: [[sequelize.literal('viewCount'), 'DESC']],
    limit,
    subQuery: false
  });

  successResponse(res, { users });
});

// Thống kê theo thể loại
const getGenreStats = catchAsync(async (req, res) => {
  const stats = await sequelize.query(`
    SELECT 
      g.id,
      g.name,
      g.slug,
      COUNT(DISTINCT mg.movie_id) as movie_count,
      SUM(m.view_count) as total_views,
      AVG(m.rating_average) as avg_rating
    FROM genres g
    LEFT JOIN movie_genres mg ON g.id = mg.genre_id
    LEFT JOIN movies m ON mg.movie_id = m.id
    WHERE g.is_active = true
    GROUP BY g.id, g.name, g.slug
    ORDER BY movie_count DESC
  `, { type: sequelize.QueryTypes.SELECT });

  successResponse(res, { stats });
});

// Thống kê theo quốc gia
const getCountryStats = catchAsync(async (req, res) => {
  const stats = await sequelize.query(`
    SELECT 
      c.id,
      c.name,
      c.code,
      c.slug,
      COUNT(DISTINCT mc.movie_id) as movie_count,
      SUM(m.view_count) as total_views,
      AVG(m.rating_average) as avg_rating
    FROM countries c
    LEFT JOIN movie_countries mc ON c.id = mc.country_id
    LEFT JOIN movies m ON mc.movie_id = m.id
    WHERE c.is_active = true
    GROUP BY c.id, c.name, c.code, c.slug
    ORDER BY movie_count DESC
  `, { type: sequelize.QueryTypes.SELECT });

  successResponse(res, { stats });
});

// Thống kê theo năm
const getYearStats = catchAsync(async (req, res) => {
  const stats = await Movie.findAll({
    attributes: [
      'releaseYear',
      [sequelize.fn('COUNT', sequelize.col('id')), 'movieCount'],
      [sequelize.fn('SUM', sequelize.col('viewCount')), 'totalViews'],
      [sequelize.fn('AVG', sequelize.col('ratingAverage')), 'avgRating']
    ],
    where: {
      releaseYear: { [Op.ne]: null }
    },
    group: ['releaseYear'],
    order: [['releaseYear', 'DESC']]
  });

  successResponse(res, { stats });
});

// Thống kê lượt xem theo ngày
const getDailyViews = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days) || 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const views = await History.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('watchedAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      watchedAt: { [Op.gte]: startDate }
    },
    group: [sequelize.fn('DATE', sequelize.col('watchedAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('watchedAt')), 'ASC']]
  });

  successResponse(res, { views });
});

// Thống kê người dùng mới theo ngày
const getNewUsers = catchAsync(async (req, res) => {
  const days = parseInt(req.query.days) || 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const users = await User.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      createdAt: { [Op.gte]: startDate }
    },
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
  });

  successResponse(res, { users });
});

module.exports = {
  getOverview,
  getTopMovies,
  getTopUsers,
  getGenreStats,
  getCountryStats,
  getYearStats,
  getDailyViews,
  getNewUsers
};