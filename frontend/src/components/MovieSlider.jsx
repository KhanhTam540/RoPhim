// src/components/MovieSlider.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { getImageUrl } from '../utils/imageUtils';
import { FaPlay } from 'react-icons/fa';

const MovieSlider = ({ sliders }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !sliders || sliders.length === 0) {
    return (
      <div className="w-full h-[400px] bg-rophim-card animate-pulse rounded-lg" />
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation
        loop={true}
        className="w-full h-full"
      >
        {sliders.map((slider, index) => {
          const movie = slider.movie;
          const imageUrl = slider.image ? getImageUrl(slider.image) : null;
          const posterUrl = movie?.poster ? getImageUrl(movie.poster) : null;
          
          // Xác định link đến trang chi tiết
          const detailLink = movie 
            ? `/phim/${movie.slug}` 
            : (slider.link || '#');

          return (
            <SwiperSlide key={slider.id || index}>
              <div className="relative w-full h-full">
                {/* Background Image */}
                {imageUrl && (
                  <div className="absolute inset-0">
                    <img
                      src={imageUrl}
                      alt={slider.title || movie?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                  </div>
                )}

                {/* Content */}
                <div className="relative container-custom h-full flex items-center">
                  <div className="max-w-2xl text-white">
                    {movie?.poster && (
                      <Link to={detailLink}>
                        <img
                          src={posterUrl}
                          alt={movie.title}
                          className="w-24 h-36 md:w-32 md:h-48 rounded-lg shadow-2xl mb-4 border-2 border-white/20 hover:border-red-500 transition-all hover:scale-105 cursor-pointer"
                        />
                      </Link>
                    )}
                    
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2">
                      {slider.title || movie?.title}
                    </h2>
                    
                    {slider.description && (
                      <p className="text-sm md:text-base text-gray-200 mb-4 line-clamp-2">
                        {slider.description}
                      </p>
                    )}
                    
                    {movie && (
                      <div className="flex items-center space-x-4 mb-6">
                        {movie.releaseYear && (
                          <span className="text-sm text-gray-300">
                            {movie.releaseYear}
                          </span>
                        )}
                        {movie.quality && (
                          <span className="px-2 py-1 bg-blue-600 text-xs rounded">
                            {movie.quality}
                          </span>
                        )}
                        {movie.type === 'series' && (
                          <span className="px-2 py-1 bg-purple-600 text-xs rounded">
                            Phim Bộ
                          </span>
                        )}
                        {movie.ratingAverage > 0 && (
                          <span className="flex items-center gap-1 text-yellow-400">
                            ⭐ {movie.ratingAverage.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <Link
                      to={detailLink}
                      className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                      <FaPlay />
                      <span>Xem ngay</span>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default MovieSlider;