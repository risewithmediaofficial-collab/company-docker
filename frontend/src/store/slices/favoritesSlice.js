import { createSlice } from '@reduxjs/toolkit';

const savedFavorites = localStorage.getItem('favorites');
const initialState = {
  items: savedFavorites ? JSON.parse(savedFavorites) : [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const { id, type, name, icon } = action.payload;
      const exists = state.items.some((item) => item.id === id && item.type === type);
      
      if (!exists) {
        state.items.push({
          id,
          type, // 'project', 'task', 'client', 'lead', etc.
          name,
          icon,
          addedAt: new Date().toISOString(),
        });
        localStorage.setItem('favorites', JSON.stringify(state.items));
      }
    },
    
    removeFavorite: (state, action) => {
      const { id, type } = action.payload;
      state.items = state.items.filter((item) => !(item.id === id && item.type === type));
      localStorage.setItem('favorites', JSON.stringify(state.items));
    },
    
    isFavorite: (state, action) => {
      const { id, type } = action.payload;
      return state.items.some((item) => item.id === id && item.type === type);
    },
  },
});

export const { addFavorite, removeFavorite, isFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
