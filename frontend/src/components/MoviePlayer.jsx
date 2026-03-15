// src/components/MoviePlayer.jsx
import { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from 'react-icons/fa'

const MoviePlayer = ({ movie, selectedEpisode, onEpisodeChange, onStartWatching, onProgress }) => {
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const [played, setPlayed] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [hasWindow, setHasWindow] = useState(false)
  const playerRef = useRef(null)
  const containerRef = useRef(null)

  const videoUrl = selectedEpisode?.videoUrl || movie?.videoUrl

  useEffect(() => {
    setHasWindow(true)
  }, [])

  useEffect(() => {
    if (videoUrl && onStartWatching) {
      onStartWatching()
    }
  }, [videoUrl])

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played)
      if (onProgress) {
        onProgress(state.played * 100) // Gửi phần trăm
      }
    }
  }

  const handleSeekChange = (e) => {
    setPlayed(parseFloat(e.target.value))
  }

  const handleSeekMouseDown = () => {
    setSeeking(true)
  }

  const handleSeekMouseUp = (e) => {
    setSeeking(false)
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.target.value))
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setFullscreen(!fullscreen)
  }

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-rophim-card rounded-lg flex items-center justify-center">
        <p className="text-rophim-textSecondary">Video không khả dụng</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group aspect-video"
    >
      {hasWindow && (
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          onProgress={handleProgress}
          progressInterval={1000}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: true
              }
            }
          }}
        />
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={played}
          onMouseDown={handleSeekMouseDown}
          onMouseUp={handleSeekMouseUp}
          onChange={handleSeekChange}
          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={() => setPlaying(!playing)}
              className="text-white hover:text-purple-500 transition-colors"
              aria-label={playing ? 'Tạm dừng' : 'Phát'}
            >
              {playing ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted(!muted)}
                className="text-white hover:text-purple-500 transition-colors"
                aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {muted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value))
                  setMuted(false)
                }}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                aria-label="Âm lượng"
              />
            </div>
          </div>

          {/* Episode Selector */}
          {movie?.type === 'series' && movie.episodes?.length > 0 && onEpisodeChange && (
            <select
              value={selectedEpisode?.id || ''}
              onChange={(e) => {
                const episode = movie.episodes.find(ep => ep.id === parseInt(e.target.value))
                if (onEpisodeChange) {
                  onEpisodeChange(episode)
                }
              }}
              className="bg-black/50 text-white border border-white/20 rounded px-3 py-1 text-sm"
              aria-label="Chọn tập"
            >
              {movie.episodes.map(ep => (
                <option key={ep.id} value={ep.id}>
                  Tập {ep.episodeNumber}: {ep.title || `Tập ${ep.episodeNumber}`}
                </option>
              ))}
            </select>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-purple-500 transition-colors"
            aria-label={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {fullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MoviePlayer