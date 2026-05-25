/**
 * Bulk Actions Utility for managing multiple item selections and operations
 */

/**
 * Create bulk action state
 */
export const createBulkState = () => ({
  selected: new Set(),
  selectAll: false,
});

/**
 * Toggle item selection
 */
export const toggleItemSelection = (state, itemId) => {
  const newState = { ...state };
  if (newState.selected.has(itemId)) {
    newState.selected.delete(itemId);
  } else {
    newState.selected.add(itemId);
  }
  return newState;
};

/**
 * Select all items
 */
export const selectAllItems = (state, items) => {
  const newState = { ...state };
  items.forEach((item) => newState.selected.add(item._id));
  newState.selectAll = true;
  return newState;
};

/**
 * Deselect all items
 */
export const deselectAllItems = () => ({
  selected: new Set(),
  selectAll: false,
});

/**
 * Check if item is selected
 */
export const isItemSelected = (state, itemId) => {
  return state.selected.has(itemId);
};

/**
 * Get selected count
 */
export const getSelectedCount = (state) => {
  return state.selected.size;
};

/**
 * Get selected IDs as array
 */
export const getSelectedIds = (state) => {
  return Array.from(state.selected);
};

/**
 * Check if all items are selected
 */
export const areAllSelected = (state, totalItems) => {
  return state.selected.size === totalItems && state.selectAll;
};
