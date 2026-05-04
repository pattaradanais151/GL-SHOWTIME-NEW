import { Star, PlayCircle } from 'lucide-react';
import { getYoutubeThumbnail } from '../utils/youtube';

const MovieCard = ({ movie }) => {
  const coverUrl = getYoutubeThumbnail(movie.youtube_url);

  return (
    <div className="glass-panel movie-card">
      <div className="card-image-container">
        <img 
          src={coverUrl} 
          alt={movie.title} 
          className="card-image"
        />
        <div className="platform-tag">
           {movie.platform || 'YOUTUBE'}
        </div>
        <div className="play-overlay">
           <a href={movie.youtube_url} target="_blank" rel="noreferrer">
             <PlayCircle size={48} className="play-icon" />
           </a>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title" title={movie.title}>{movie.title}</h3>
          <div className="rating-badge">
            <Star size={14} fill="currentColor" />
            <span>{movie.rating || 'N/A'}</span>
          </div>
        </div>
        <div className="card-meta">
          <span>{movie.genre}</span>
          <span>{movie.air_date}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;