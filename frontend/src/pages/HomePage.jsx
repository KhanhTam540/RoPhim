// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import { 
  FaPlay, FaStar, FaCalendar, FaFilm, FaGlobe, FaAngleRight,
  FaFire, FaClock, FaHeart, FaPlayCircle, FaTv, FaTicketAlt,
  FaComment, FaEye, FaThumbsUp, FaHotjar, FaNewspaper,
  FaFilm as FaMovie, FaUserFriends, FaChartLine
} from 'react-icons/fa'

// Import components
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'

// Import API
import { homeApi, movieApi, commentApi } from '../api/auth'

// Import utilities
import { getImageUrl, getAvatarUrl } from '../utils/imageUtils'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

const HomePage = () => {
  const [data, setData] = useState({
    sliders: [],
    trendingMovies: [],
    latestMovies: [],
    topRatedMovies: [],
    seriesMovies: [],
    singleMovies: [],
    genres: [],
    countries: []
  })
  
  // State cho phim theo quốc gia
  const [vietnamMovies, setVietnamMovies] = useState([])
  const [koreaMovies, setKoreaMovies] = useState([])
  const [chinaMovies, setChinaMovies] = useState([])
  const [japanMovies, setJapanMovies] = useState([])
  const [thailandMovies, setThailandMovies] = useState([])
  const [usUkMovies, setUsUkMovies] = useState([])
  const [animeMovies, setAnimeMovies] = useState([])
  
  // State cho các phần mới
  const [topComments, setTopComments] = useState([])
  const [hotTopics, setHotTopics] = useState([])
  const [mostLiked, setMostLiked] = useState([])
  const [hotGenres, setHotGenres] = useState([])
  const [recentComments, setRecentComments] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadHomeData()
    loadAllCountryMovies()
    loadAdditionalData()
  }, [])

  const loadHomeData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await homeApi.getHomeData()
      
      console.log('📦 Home data loaded:', response)

      const homeData = response.data || response || {}
      
      setData({
        sliders: homeData.sliders || [],
        trendingMovies: homeData.trendingMovies || [],
        latestMovies: homeData.latestMovies || [],
        topRatedMovies: homeData.topRatedMovies || [],
        seriesMovies: homeData.seriesMovies || [],
        singleMovies: homeData.singleMovies || [],
        genres: homeData.genres || [],
        countries: homeData.countries || []
      })
    } catch (error) {
      console.error('❌ Error loading home data:', error)
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const loadAllCountryMovies = async () => {
    try {
      // Phim Việt Nam
      const vietnamRes = await movieApi.getMovies({ 
        country: 'viet-nam', 
        limit: 4,
        sort: 'latest'
      }).catch(() => ({ data: { movies: [] } }))
      setVietnamMovies(vietnamRes.data?.movies || [])

      // Phim Hàn Quốc
      const koreaRes = await movieApi.getMovies({ 
        country: 'han-quoc', 
        limit: 4,
        sort: 'latest'
      }).catch(() => ({ data: { movies: [] } }))
      setKoreaMovies(koreaRes.data?.movies || [])

      // Phim Trung Quốc
      const chinaRes = await movieApi.getMovies({ 
        country: 'trung-quoc', 
        limit: 4,
        sort: 'latest'
      }).catch(() => ({ data: { movies: [] } }))
      setChinaMovies(chinaRes.data?.movies || [])

      // Phim Nhật Bản
      const japanRes = await movieApi.getMovies({ 
        country: 'nhat-ban', 
        limit: 4,
        sort: 'latest'
      }).catch(() => ({ data: { movies: [] } }))
      setJapanMovies(japanRes.data?.movies || [])

      // Phim Thái Lan
      const thailandRes = await movieApi.getMovies({ 
        country: 'thai-lan', 
        limit: 4,
        sort: 'latest'
      }).catch(() => ({ data: { movies: [] } }))
      setThailandMovies(thailandRes.data?.movies || [])

      // Phim Mỹ/Anh
      const usRes = await movieApi.getMovies({ 
        country: 'my', 
        limit: 2,
        sort: 'latest'
      }).catch(() => ({ data: { movies: [] } }))
      const ukRes = await movieApi.getMovies({ 
        country: 'anh', 
        limit: 2,
        sort: 'latest'
      }).catch(() => ({ data: { movies: [] } }))
      setUsUkMovies([
        ...(usRes.data?.movies || []),
        ...(ukRes.data?.movies || [])
      ].slice(0, 4))

      // Anime (thể loại hoạt hình)
      const animeRes = await movieApi.getMovies({ 
        genre: 'hoat-hinh', 
        limit: 8,
        sort: 'latest'
      }).catch(() => ({ data: { movies: [] } }))
      setAnimeMovies(animeRes.data?.movies || [])

    } catch (error) {
      console.error('❌ Error loading country movies:', error)
    }
  }

  const loadAdditionalData = async () => {
    try {
      // Mock data cho các phần tạm thời (sẽ thay bằng API thật sau)
      setTopComments([
        { id: 1, user: { name: 'Quản 00', avatar: null }, content: 'Cần tìm trăn làm xem phim này', likes: 5, replies: 2, views: 120 },
        { id: 2, user: { name: 'huyen 00', avatar: null }, content: 'bao giờ ra thế rồi', likes: 3, replies: 1, views: 85 },
        { id: 3, user: { name: 'Trang 00', avatar: null }, content: 'Xin phím', likes: 8, replies: 4, views: 200 },
        { id: 4, user: { name: 'Solo Mio', avatar: null }, content: 'Solo Mio', likes: 2, replies: 0, views: 45 },
      ])

      setHotTopics([
        { id: 1, title: 'Tiếng Yêu Này Anh Dịch Được Không?', views: 1500 },
        { id: 2, title: 'Trao Em Cả Về Tuy', views: 1200 },
        { id: 3, title: 'Trục Ngọc', views: 980 },
        { id: 4, title: 'Phi Vy Đặng Trôi 2', views: 750 },
        { id: 5, title: 'Song Quý', views: 600 },
      ])

      setMostLiked([
        { id: 1, title: 'Những Ông Bố Của Ma Ri', likes: 450 },
        { id: 2, title: 'Con Tôi Hẹn Hò (Phần 2)', likes: 380 },
        { id: 3, title: 'Ny Hôn Siren', likes: 320 },
        { id: 4, title: 'Giải Kinh Tiến Yêu', likes: 290 },
        { id: 5, title: 'Trở Lại Năm 2000', likes: 250 },
      ])

      setHotGenres([
        { id: 1, name: 'Chính kịch', slug: 'chinh-kich', count: 45 },
        { id: 2, name: 'Tâm lý', slug: 'tam-ly', count: 42 },
        { id: 3, name: 'Tình Cảm', slug: 'tinh-cam', count: 38 },
        { id: 4, name: 'Hài Hước', slug: 'hai-huoc', count: 35 },
        { id: 5, name: 'Hành Động', slug: 'hanh-dong', count: 32 },
      ])

      setRecentComments([
        { id: 1, content: 'hay quá trời ơi!', movie: 'Song Quý', time: '7 giờ trước', user: 'Nguyen Van A' },
        { id: 2, content: 'cần tìm trăn làm xem phim này', movie: 'Tiếng Yêu Này Anh Dịch Được Không?', time: '7 giờ trước', user: 'Tran Thi B' },
        { id: 3, content: 'bao giờ ra thế rồi', movie: 'Thủ Gĩt', time: '7 giờ trước', user: 'Le Van C' },
        { id: 4, content: 'Xin phím', movie: 'Mùa Phổ', time: '8 giờ trước', user: 'Pham Thi D' },
      ])

    } catch (error) {
      console.error('Error loading additional data:', error)
    }
  }

  // Component hiển thị section phim
  const MovieSection = ({ title, movies, viewAllLink, icon, className = '' }) => {
    if (!movies || movies.length === 0) return null

    return (
      <section className={`py-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {icon}
            <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          </div>
          <Link 
            to={viewAllLink} 
            className="text-blue-500 hover:text-blue-400 text-sm md:text-base flex items-center gap-1"
          >
            Xem tất cả
            <FaAngleRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {movies.slice(0, 8).map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </div>
      </section>
    )
  }

  // Component hiển thị chủ đề quan tâm
  const TopicCard = ({ icon, title, count, link }) => (
    <Link to={link} className="block bg-rophim-card hover:bg-rophim-hover p-4 rounded-lg transition-all border border-rophim-border hover:border-blue-500">
      <div className="flex items-center space-x-3 mb-2">
        <div className="text-2xl">{icon}</div>
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-sm text-rophim-textSecondary">{count} phim</p>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadHomeData}
            className="btn-primary"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>RoPhim | Rổ Phim Mới | Phim Hay</title>
        <meta name="description" content="Xem phim online miễn phí chất lượng cao. Cập nhật phim mới nhất, phim hot nhất." />
      </Helmet>

{/* Hero Slider Section */}
{data.sliders && data.sliders.length > 0 && (
  <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[500px] overflow-hidden -mt-16 md:-mt-20">
    <Swiper
      modules={[Autoplay, Pagination, Navigation, EffectFade]}
      effect="fade"
      fadeEffect={{ crossFade: true }} // THÊM DÒNG NÀY để fade chéo
      spaceBetween={0}
      slidesPerView={1}
      autoplay={{ 
        delay: 5000, 
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      }}
      pagination={{ 
        clickable: true,
        dynamicBullets: true
      }}
      navigation
      loop={true}
      speed={800} // Giảm speed cho mượt mà hơn
      className="h-full"
      onSlideChange={() => console.log('slide changed')} // Debug
    >
      {data.sliders.map((slider, index) => {
        const imageUrl = slider.image ? getImageUrl(slider.image) : 'https://via.placeholder.com/1920x1080?text=Slider'
        
        return (
          <SwiperSlide key={slider.id || index}>
            {({ isActive }) => ( // Sử dụng isActive để kiểm tra slide đang active
              <div className={`relative h-full transition-opacity duration-800 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}>
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={imageUrl}
                    alt={slider.title || 'Slider'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://via.placeholder.com/1920x1080?text=Slider'
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-rophim-bg via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative h-full container-custom flex items-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 30 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-2xl text-white"
                  >
                    {slider.movie && slider.movie.type === 'series' && (
                      <span className="inline-block bg-purple-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
                        Phim bộ
                      </span>
                    )}
                    
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 line-clamp-3">
                      {slider.title || slider.movie?.title || 'Phim hot'}
                    </h1>
                    
                    {slider.description && (
                      <p className="text-sm md:text-base text-gray-300 mb-6 line-clamp-3 md:line-clamp-4">
                        {slider.description}
                      </p>
                    )}

                    {slider.movie && slider.movie.slug && (
                      <Link
                        to={`/phim/${slider.movie.slug}`}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                      >
                        <FaPlay size={16} />
                        <span>Xem ngay</span>
                      </Link>
                    )}
                  </motion.div>
                </div>
              </div>
            )}
          </SwiperSlide>
        )
      })}
    </Swiper>
  </section>
)}

      {/* Main Content */}
      <div className="container-custom py-6 md:py-8 space-y-8">
        
        {/* ===== BẠN ĐANG QUAN TÂM GÌ? ===== */}
        <section className="py-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Bạn đang quan tâm gì?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <TopicCard icon="📺" title="Phim bộ" count="245" link="/phim-bo" />
            <TopicCard icon="🎬" title="Phim Lẻ" count="189" link="/phim-le" />
            <TopicCard icon="🎨" title="Hoạt Hình" count="156" link="/the-loai/hoat-hinh" />
            <TopicCard icon="🎟️" title="Phim Chiếu Rạp" count="98" link="/phim-chieu-rap" />
            <TopicCard icon="📡" title="TV Shows" count="67" link="/tv-shows" />
            <TopicCard icon="🎭" title="Chính kịch" count="124" link="/the-loai/chinh-kich" />
            <TopicCard icon="➕" title="+32 chủ đề" count="Xem tất cả" link="/the-loai" />
          </div>
        </section>

        {/* ===== HAI CỘT NỘI DUNG ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái - Phim theo quốc gia */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Phim Hàn Quốc Mới */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Phim Hàn Quốc Mới</h3>
                <Link to="/quoc-gia/han-quoc" className="text-blue-500 text-sm hover:text-blue-400">
                  Xem toàn bộ
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {koreaMovies.slice(0, 4).map((movie, index) => (
                  <MovieCard key={movie.id || index} movie={movie} />
                ))}
              </div>
            </div>

            {/* Phim Trung Quốc mới */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Phim Trung Quốc mới</h3>
                <Link to="/quoc-gia/trung-quoc" className="text-blue-500 text-sm hover:text-blue-400">
                  Xem toàn bộ
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {chinaMovies.slice(0, 4).map((movie, index) => (
                  <MovieCard key={movie.id || index} movie={movie} />
                ))}
              </div>
            </div>

            {/* Phim US-UK mới */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Phim US-UK mới</h3>
                <Link to="/quoc-gia/my" className="text-blue-500 text-sm hover:text-blue-400">
                  Xem toàn bộ
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {usUkMovies.slice(0, 4).map((movie, index) => (
                  <MovieCard key={movie.id || index} movie={movie} />
                ))}
              </div>
            </div>

            {/* Phim Nhật Bản mới */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">Phim Nhật Bản mới</h3>
                <Link to="/quoc-gia/nhat-ban" className="text-blue-500 text-sm hover:text-blue-400">
                  Xem toàn bộ
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {japanMovies.slice(0, 4).map((movie, index) => (
                  <MovieCard key={movie.id || index} movie={movie} />
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải - Sidebar */}
          <div className="space-y-6">
            
            {/* TOP BÌNH LUẬN */}
            <div className="bg-rophim-card rounded-lg p-4 border border-rophim-border">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaComment className="mr-2 text-blue-500" />
                TOP BÌNH LUẬN
              </h3>
              <div className="space-y-4">
                {topComments.map((comment) => (
                  <div key={comment.id} className="border-b border-rophim-border pb-3 last:border-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {comment.user.avatar ? (
                        <img src={getAvatarUrl(comment.user.avatar)} alt={comment.user.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">
                          {comment.user.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-sm">{comment.user.name}</span>
                    </div>
                    <p className="text-sm text-rophim-textSecondary mb-2">{comment.content}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>❤️ {comment.likes}</span>
                      <span>💬 {comment.replies}</span>
                      <span>👁️ {comment.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SÔI NỔI NHẤT */}
            <div className="bg-rophim-card rounded-lg p-4 border border-rophim-border">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaHotjar className="mr-2 text-orange-500" />
                SÔI NỔI NHẤT
              </h3>
              <div className="space-y-3">
                {hotTopics.map((topic, index) => (
                  <Link key={topic.id} to={`/phim/${topic.id}`} className="flex items-center space-x-3 hover:bg-rophim-hover p-2 rounded-lg transition-colors">
                    <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                    <span className="flex-1 text-sm line-clamp-1">{topic.title}</span>
                    <span className="text-xs text-gray-500">{topic.views.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* YÊU THÍCH NHẤT */}
            <div className="bg-rophim-card rounded-lg p-4 border border-rophim-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <FaHeart className="mr-2 text-red-500" />
                  YÊU THÍCH NHẤT
                </h3>
                <Link to="/yeu-thich" className="text-xs text-blue-500 hover:text-blue-400">
                  Xem thêm
                </Link>
              </div>
              <div className="space-y-3">
                {mostLiked.map((item, index) => (
                  <Link key={item.id} to={`/phim/${item.id}`} className="flex items-center justify-between hover:bg-rophim-hover p-2 rounded-lg transition-colors">
                    <span className="text-sm line-clamp-1 flex-1">{item.title}</span>
                    <span className="text-xs text-red-500 ml-2">❤️ {item.likes}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* THỂ LOẠI HOT */}
            <div className="bg-rophim-card rounded-lg p-4 border border-rophim-border">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaFilm className="mr-2 text-green-500" />
                THỂ LOẠI HOT
              </h3>
              <div className="space-y-3">
                {hotGenres.map((genre, index) => (
                  <Link key={genre.id} to={`/the-loai/${genre.slug}`} className="flex items-center space-x-3 hover:bg-rophim-hover p-2 rounded-lg transition-colors">
                    <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                    <span className="flex-1 text-sm">{genre.name}</span>
                    <span className="text-xs text-gray-500">{genre.count} phim</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* BÌNH LUẬN MỚI */}
            <div className="bg-rophim-card rounded-lg p-4 border border-rophim-border">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaNewspaper className="mr-2 text-purple-500" />
                BÌNH LUẬN MỚI
              </h3>
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <div key={comment.id} className="border-b border-rophim-border pb-3 last:border-0">
                    <p className="text-xs text-gray-500 mb-1">{comment.time}</p>
                    <p className="text-sm mb-1">"{comment.content}"</p>
                    <p className="text-xs text-blue-500">: {comment.movie}</p>
                  </div>
                ))}
              </div>
              <Link to="/binh-luan" className="block text-center text-sm text-blue-500 hover:text-blue-400 mt-4">
                Xem thêm
              </Link>
            </div>
          </div>
        </div>

        {/* ===== CÁC SECTION PHIM KHÁC ===== */}
        
        {/* Phim Điện Ảnh Mới Coóng */}
        <MovieSection 
          title="Phim Điện Ảnh Mới Coóng"
          movies={data.singleMovies}
          viewAllLink="/phim-le"
          icon={<FaPlayCircle className="text-red-500 text-2xl" />}
        />

        {/* Kho Tàng Anime Mới Nhất */}
        <MovieSection 
          title="Kho Tàng Anime Mới Nhất"
          movies={animeMovies}
          viewAllLink="/the-loai/hoat-hinh"
          icon={<FaTv className="text-purple-500 text-2xl" />}
        />

        {/* Phim Hot */}
        {data.trendingMovies && data.trendingMovies.length > 0 && (
          <MovieSection 
            title="Phim Hot"
            movies={data.trendingMovies}
            viewAllLink="/phim-hot"
            icon={<FaFire className="text-orange-500 text-2xl" />}
          />
        )}

        {/* Phim Mới Cập Nhật */}
        {data.latestMovies && data.latestMovies.length > 0 && (
          <MovieSection 
            title="Phim Mới Cập Nhật"
            movies={data.latestMovies}
            viewAllLink="/phim-moi"
            icon={<FaClock className="text-green-500 text-2xl" />}
          />
        )}

        {/* ===== SLOGAN ===== */}
        <section className="py-8 text-center">
          <p className="text-xl md:text-2xl text-gray-400">
            Xem Phim Miễn Phí Cực Nhanh, Chất Lượng Cao Và Cập Nhật Liên Tục
          </p>
        </section>
      </div>
    </>
  )
}

export default HomePage