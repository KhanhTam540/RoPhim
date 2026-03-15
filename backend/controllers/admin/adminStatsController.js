const { Movie, User, Comment, Rating, History, Genre, Country, sequelize } = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/responseHandler');
const { Op } = require('sequelize');

// Thống kê tổng quan
const getOverview = catchAsync(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date();
  startOfMonth.setMonth(startOfMonth.getMonth() - 1);

  // Tổng số
  const totalMovies = await Movie.count({
    where: { is_active: true }
  });
  const totalUsers = await User.count();
  const totalComments = await Comment.count({
    where: { is_active: true }
  });
  const totalRatings = await Rating.count();

  // Tổng lượt xem
  const totalViewsResult = await Movie.sum('view_count');
  const totalViews = totalViewsResult || 0;

  // Hôm nay
  const todayMovies = await Movie.count({
    where: {
      created_at: { [Op.gte]: startOfDay },
      is_active: true
    }
  });
  const todayUsers = await User.count({
    where: { created_at: { [Op.gte]: startOfDay } }
  });
  const todayViews = await History.count({
    where: { watched_at: { [Op.gte]: startOfDay } }
  });

  // 7 ngày qua
  const weekMovies = await Movie.count({
    where: {
      created_at: { [Op.gte]: startOfWeek },
      is_active: true
    }
  });
  const weekUsers = await User.count({
    where: { created_at: { [Op.gte]: startOfWeek } }
  });
  const weekViews = await History.count({
    where: { watched_at: { [Op.gte]: startOfWeek } }
  });

  // 30 ngày qua
  const monthMovies = await Movie.count({
    where: {
      created_at: { [Op.gte]: startOfMonth },
      is_active: true
    }
  });
  const monthUsers = await User.count({
    where: { created_at: { [Op.gte]: startOfMonth } }
  });
  const monthViews = await History.count({
    where: { watched_at: { [Op.gte]: startOfMonth } }
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
      'id', 
      'title', 
      'slug', 
      'poster', 
      'view_count', 
      'rating_average', 
      'rating_count', 
      'type'
    ],
    where: { is_active: true },
    order: [['view_count', 'DESC']],
    limit
  });

  successResponse(res, { movies });
});

// Top người dùng tích cực
const getTopUsers = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const users = await User.findAll({
    attributes: [
      'id', 
      'username', 
      'full_name', 
      'avatar', 
      'created_at'
    ],
    where: { is_active: true },
    include: [
      {
        model: Comment,
        as: 'comments',
        attributes: [],
        required: false
      },
      {
        model: Rating,
        as: 'ratings',
        attributes: [],
        required: false
      },
      {
        model: History,
        as: 'histories',
        attributes: [],
        required: false
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
  const stats = await Genre.findAll({
    attributes: [
      'id',
      'name',
      'slug',
      [sequelize.fn('COUNT', sequelize.col('movies.id')), 'movie_count'],
      [sequelize.fn('SUM', sequelize.col('movies.view_count')), 'total_views'],
      [sequelize.fn('AVG', sequelize.col('movies.rating_average')), 'avg_rating']
    ],
    include: [
      {
        model: Movie,
        as: 'movies',
        attributes: [],
        through: { attributes: [] },
        required: false,
        where: { is_active: true }
      }
    ],
    where: { is_active: true },
    group: ['Genre.id'],
    order: [[sequelize.literal('movie_count'), 'DESC']]
  });

  successResponse(res, { stats });
});

// Thống kê theo quốc gia
const getCountryStats = catchAsync(async (req, res) => {
  const stats = await Country.findAll({
    attributes: [
      'id',
      'name',
      'code',
      'slug',
      [sequelize.fn('COUNT', sequelize.col('movies.id')), 'movie_count'],
      [sequelize.fn('SUM', sequelize.col('movies.view_count')), 'total_views'],
      [sequelize.fn('AVG', sequelize.col('movies.rating_average')), 'avg_rating']
    ],
    include: [
      {
        model: Movie,
        as: 'movies',
        attributes: [],
        through: { attributes: [] },
        required: false,
        where: { is_active: true }
      }
    ],
    where: { is_active: true },
    group: ['Country.id'],
    order: [[sequelize.literal('movie_count'), 'DESC']]
  });

  successResponse(res, { stats });
});

// Thống kê theo năm
const getYearStats = catchAsync(async (req, res) => {
  const stats = await Movie.findAll({
    attributes: [
      'release_year',
      [sequelize.fn('COUNT', sequelize.col('id')), 'movie_count'],
      [sequelize.fn('SUM', sequelize.col('view_count')), 'total_views'],
      [sequelize.fn('AVG', sequelize.col('rating_average')), 'avg_rating']
    ],
    where: {
      release_year: { [Op.ne]: null },
      is_active: true
    },
    group: ['release_year'],
    order: [['release_year', 'DESC']]
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
      [sequelize.fn('DATE', sequelize.col('watched_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      watched_at: { [Op.gte]: startDate }
    },
    group: [sequelize.fn('DATE', sequelize.col('watched_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('watched_at')), 'ASC']]
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
      [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      created_at: { [Op.gte]: startDate }
    },
    group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
  });

  successResponse(res, { users });
});

// Thống kê tổng hợp cho dashboard
const getDashboardStats = catchAsync(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date();
  startOfMonth.setMonth(startOfMonth.getMonth() - 1);

  // Lấy tất cả thống kê cùng lúc
  const [
    totalMovies,
    totalUsers,
    totalComments,
    totalRatings,
    totalViews,
    todayViews,
    weekViews,
    monthViews,
    todayUsers,
    weekUsers,
    monthUsers,
    todayMovies,
    weekMovies,
    monthMovies,
    topMovies,
    recentUsers
  ] = await Promise.all([
    // Tổng số
    Movie.count({ where: { is_active: true } }),
    User.count(),
    Comment.count({ where: { is_active: true } }),
    Rating.count(),
    Movie.sum('view_count'),
    
    // Views theo thời gian
    History.count({ where: { watched_at: { [Op.gte]: startOfDay } } }),
    History.count({ where: { watched_at: { [Op.gte]: startOfWeek } } }),
    History.count({ where: { watched_at: { [Op.gte]: startOfMonth } } }),
    
    // Users mới
    User.count({ where: { created_at: { [Op.gte]: startOfDay } } }),
    User.count({ where: { created_at: { [Op.gte]: startOfWeek } } }),
    User.count({ where: { created_at: { [Op.gte]: startOfMonth } } }),
    
    // Phim mới
    Movie.count({ where: { created_at: { [Op.gte]: startOfDay }, is_active: true } }),
    Movie.count({ where: { created_at: { [Op.gte]: startOfWeek }, is_active: true } }),
    Movie.count({ where: { created_at: { [Op.gte]: startOfMonth }, is_active: true } }),
    
    // Top phim
    Movie.findAll({
      attributes: ['id', 'title', 'slug', 'poster', 'view_count', 'rating_average'],
      where: { is_active: true },
      order: [['view_count', 'DESC']],
      limit: 5
    }),
    
    // Người dùng gần đây
    User.findAll({
      attributes: ['id', 'username', 'full_name', 'avatar', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5
    })
  ]);

  successResponse(res, {
    overview: {
      total: {
        movies: totalMovies || 0,
        users: totalUsers || 0,
        comments: totalComments || 0,
        ratings: totalRatings || 0,
        views: totalViews || 0
      },
      today: {
        movies: todayMovies || 0,
        users: todayUsers || 0,
        views: todayViews || 0
      },
      week: {
        movies: weekMovies || 0,
        users: weekUsers || 0,
        views: weekViews || 0
      },
      month: {
        movies: monthMovies || 0,
        users: monthUsers || 0,
        views: monthViews || 0
      }
    },
    topMovies: topMovies || [],
    recentUsers: recentUsers || []
  });
});

module.exports = {
  getOverview,
  getTopMovies,
  getTopUsers,
  getGenreStats,
  getCountryStats,
  getYearStats,
  getDailyViews,
  getNewUsers,
  getDashboardStats
};