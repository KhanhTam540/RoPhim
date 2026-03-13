import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import MovieCard from './MovieCard'

const MovieRow = ({ title, viewAllLink, movies = [] }) => {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = direction === 'left' 
        ? -current.offsetWidth 
        : current.offsetWidth
      
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Nếu không có phim thì không hiển thị
  if (!movies || movies.length === 0) {
    return null
  }

  return (
    <section className="py-4 md:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-blue-500 hover:text-blue-400 text-sm md:text-base"
          >
            Xem tất cả
          </Link>
        )}
      </div>

      {/* Movies carousel */}
      <div className="relative group">
        {/* Scroll buttons - ẩn trên mobile */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          disabled={!movies || movies.length === 0}
          aria-label="Cuộn sang trái"
        >
          <FaChevronLeft />
        </button>

        <button
          onClick={() => scroll('right')}
          className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          disabled={!movies || movies.length === 0}
          aria-label="Cuộn sang phải"
        >
          <FaChevronRight />
        </button>

        {/* Movies container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-3 lg:gap-4 pb-2 md:pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <div
              key={movie?.id || index}
              className="flex-none w-[130px] sm:w-[150px] md:w-[160px] lg:w-[180px] xl:w-[200px]"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MovieRow