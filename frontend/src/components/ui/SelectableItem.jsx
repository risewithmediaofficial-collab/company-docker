import { Checkbox } from './checkbox';

/**
 * Selectable list item component
 * Wraps item content with a checkbox for bulk selection
 */
const SelectableItem = ({
  itemId,
  isSelected,
  onToggle,
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(itemId)}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
};

export default SelectableItem;
