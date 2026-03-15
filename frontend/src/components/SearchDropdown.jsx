// src/components/SearchDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchApi } from '../api/auth';
import useDebounce from '../hooks/useDebounce';
import { getImageUrl } from '../utils/imageUtils';
import { FaSearch, FaFilm, FaUser, FaUsers } from 'react-icons/fa';

const SearchDropdown = ({ keyword, onClose }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const dropdownRef = useRef(null);
  
  // Debounce keyword để tránh gọi API quá nhiều
  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    if (debouncedKeyword.length >= 2) {
      performSearch();
    } else {
      setResults(null);
    }
  }, [debouncedKeyword]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const response = await searchApi.search({ 
        keyword: debouncedKeyword, 
        limit: 5 // Chỉ lấy 5 kết quả mỗi loại
      });
      
      console.log('🔍 Search results:', response.data);
      setResults(response.data);
    } catch (error) {
      console.error('❌ Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc kết quả theo tab
  const getFilteredResults = () => {
    if (!results) return { movies: [], actors: [], directors: [] };
    
    switch(activeTab) {
      case 'movies':
        return { movies: results.movies || [], actors: [], directors: [] };
      case 'actors':
        return { movies: [], actors: results.actors || [], directors: [] };
      case 'directors':
        return { movies: [], actors: [], directors: results.directors || [] };
      default:
        return results;
    }
  };

  const filteredResults = getFilteredResults();
  const hasMovies = filteredResults.movies?.length > 0;
  const hasActors = filteredResults.actors?.length > 0;
  const hasDirectors = filteredResults.directors?.length > 0;
  const hasAnyResults = hasMovies || hasActors || hasDirectors;

  // Nếu keyword quá ngắn
  if (keyword.length < 2) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-rophim-card rounded-lg border border-rophim-border shadow-xl z-50 p-4">
        <p className="text-rophim-textSecondary text-center text-sm">
          Nhập ít nhất 2 ký tự để tìm kiếm
        </p>
      </div>
    );
  }

  // Đang loading
  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-rophim-card rounded-lg border border-rophim-border shadow-xl z-50 p-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-rophim-textSecondary">Đang tìm kiếm...</span>
        </div>
      </div>
    );
  }

  // Không có kết quả
  if (!hasAnyResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-rophim-card rounded-lg border border-rophim-border shadow-xl z-50 p-6">
        <p className="text-rophim-textSecondary text-center">
          Không tìm thấy kết quả cho "{keyword}"
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-rophim-card rounded-lg border border-rophim-border shadow-xl z-50 overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex border-b border-rophim-border">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'all' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-rophim-textSecondary hover:text-white'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'movies' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-rophim-textSecondary hover:text-white'
          }`}
        >
          Phim ({results?.movies?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('actors')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'actors' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-rophim-textSecondary hover:text-white'
          }`}
        >
          Diễn viên ({results?.actors?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('directors')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'directors' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-rophim-textSecondary hover:text-white'
          }`}
        >
          Đạo diễn ({results?.directors?.length || 0})
        </button>
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {/* Movies */}
        {hasMovies && (
          <div className="p-2">
            {activeTab !== 'actors' && activeTab !== 'directors' && (
              <h3 className="text-xs font-medium text-rophim-textSecondary px-2 py-1">
                PHIM
              </h3>
            )}
            {filteredResults.movies.map(movie => (
              <Link
                key={movie.id}
                to={`/movies/${movie.slug}`}
                onClick={onClose}
                className="flex items-center space-x-3 p-2 hover:bg-rophim-hover rounded-lg transition-colors group"
              >
                {movie.poster ? (
                  <img
                    src={getImageUrl(movie.poster)}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-14 bg-rophim-border rounded flex items-center justify-center">
                    <FaFilm className="text-rophim-textSecondary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-blue-500 transition-colors truncate">
                    {movie.title}
                  </p>
                  <p className="text-xs text-rophim-textSecondary">
                    {movie.releaseYear || 'N/A'} • {movie.quality || 'HD'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Actors */}
        {hasActors && (
          <div className="p-2 border-t border-rophim-border">
            {activeTab !== 'movies' && activeTab !== 'directors' && (
              <h3 className="text-xs font-medium text-rophim-textSecondary px-2 py-1">
                DIỄN VIÊN
              </h3>
            )}
            <div className="grid grid-cols-2 gap-2">
              {filteredResults.actors.map(actor => (
                <Link
                  key={actor.id}
                  to={`/actors/${actor.slug}`}
                  onClick={onClose}
                  className="flex items-center space-x-2 p-2 hover:bg-rophim-hover rounded-lg transition-colors group"
                >
                  {actor.avatar ? (
                    <img
                      src={getImageUrl(actor.avatar)}
                      alt={actor.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <FaUser className="text-white text-xs" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-blue-500 transition-colors truncate">
                      {actor.name}
                    </p>
                    {actor.nationality && (
                      <p className="text-xs text-rophim-textSecondary truncate">
                        {actor.nationality}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Directors */}
        {hasDirectors && (
          <div className="p-2 border-t border-rophim-border">
            {activeTab !== 'movies' && activeTab !== 'actors' && (
              <h3 className="text-xs font-medium text-rophim-textSecondary px-2 py-1">
                ĐẠO DIỄN
              </h3>
            )}
            <div className="grid grid-cols-2 gap-2">
              {filteredResults.directors.map(director => (
                <Link
                  key={director.id}
                  to={`/directors/${director.slug}`}
                  onClick={onClose}
                  className="flex items-center space-x-2 p-2 hover:bg-rophim-hover rounded-lg transition-colors group"
                >
                  {director.avatar ? (
                    <img
                      src={getImageUrl(director.avatar)}
                      alt={director.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <FaUsers className="text-white text-xs" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-blue-500 transition-colors truncate">
                      {director.name}
                    </p>
                    {director.nationality && (
                      <p className="text-xs text-rophim-textSecondary truncate">
                        {director.nationality}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* View all link */}
        {keyword.length >= 2 && (
          <Link
            to={`/tim-kiem?keyword=${encodeURIComponent(keyword)}`}
            onClick={onClose}
            className="block p-3 text-center text-sm text-blue-500 hover:text-blue-400 border-t border-rophim-border"
          >
            Xem tất cả kết quả cho "{keyword}"
          </Link>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;