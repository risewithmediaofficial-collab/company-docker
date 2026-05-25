import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../store/slices/favoritesSlice';

/**
 * Hook for managing favorites
 */
export const useFavorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);

  const toggleFavorite = (id, type, name, icon) => {
    const isFav = favorites.some((item) => item.id === id && item.type === type);
    
    if (isFav) {
      dispatch(removeFavorite({ id, type }));
    } else {
      dispatch(addFavorite({ id, type, name, icon }));
    }
  };

  const isFavorited = (id, type) => {
    return favorites.some((item) => item.id === id && item.type === type);
  };

  const getFavoritesByType = (type) => {
    return favorites.filter((item) => item.type === type);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorited,
    getFavoritesByType,
  };
};
