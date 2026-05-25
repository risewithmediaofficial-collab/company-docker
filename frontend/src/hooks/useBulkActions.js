import { useState, useCallback } from 'react';

/**
 * Hook for managing bulk selection and actions
 * @param {array} items - Array of items to select from
 * @param {number} pageSize - Items per page for pagination
 */
export const useBulkActions = (items = [], pageSize = 20) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Toggle single item selection
  const toggleItem = useCallback((itemId) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Select all items
  const selectAllItems = useCallback(() => {
    const allIds = new Set(items.map((item) => item._id));
    setSelectedIds(allIds);
    setSelectAll(true);
  }, [items]);

  // Deselect all items
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    setSelectAll(false);
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (selectAll) {
      deselectAll();
    } else {
      selectAllItems();
    }
  }, [selectAll, selectAllItems, deselectAll]);

  // Check if item is selected
  const isSelected = useCallback((itemId) => {
    return selectedIds.has(itemId);
  }, [selectedIds]);

  // Get selected items
  const getSelectedItems = useCallback(() => {
    return items.filter((item) => selectedIds.has(item._id));
  }, [items, selectedIds]);

  // Get selected count
  const getSelectedCount = useCallback(() => {
    return selectedIds.size;
  }, [selectedIds]);

  // Clear selection
  const clear = useCallback(() => {
    deselectAll();
  }, [deselectAll]);

  return {
    selectedIds: Array.from(selectedIds),
    toggleItem,
    selectAllItems,
    deselectAll,
    toggleSelectAll,
    isSelected,
    getSelectedItems,
    getSelectedCount,
    clear,
    selectAll,
    hasSelection: selectedIds.size > 0,
  };
};
