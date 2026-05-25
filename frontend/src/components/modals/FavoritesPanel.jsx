import { Star } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';

const FavoritesPanel = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative" title="View Favorites">
        <Star size={20} className={favorites.length > 0 ? 'fill-yellow-500 text-yellow-500' : ''} />
        {favorites.length > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-primary text-white rounded-full border-2 border-card text-[9px] font-bold flex items-center justify-center">
            {Math.min(favorites.length, 9)}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 mt-2">
        <DropdownMenuLabel>Favorites ({favorites.length})</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {favorites.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No favorites yet. Star items to add them here!
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {favorites.map((favorite) => (
              <button
                key={`${favorite.type}-${favorite.id}`}
                onClick={() => handleNavigate(favorite.path || '/')}
                className="w-full px-3 py-2 hover:bg-secondary/80 flex items-center gap-3 transition-colors text-left border-b border-border/50 last:border-0"
              >
                <span className="text-lg flex-shrink-0">{favorite.icon || '⭐'}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{favorite.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{favorite.type}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FavoritesPanel;
