import { useCallback, useContext, useMemo } from "react";
import { Draggable } from "react-beautiful-dnd";

import { sanitizeHtml } from "../../utils/html";
import type { InputItem } from "./createData";
import { CollapsedContext } from "./Ranker";

import styles from "./Ranker.module.scss";

interface ItemProps {
  item: InputItem;
  index: number;
  readonly?: boolean;
  columnId?: string;
  onItemClick?: (itemId: string, columnId: string) => void;
}

/**
 * Item component represents a draggable item within each column. Items can be dragged within a
 * given column as well as between columns.
 */
const Item = (props: ItemProps) => {
  const { item, index, readonly, columnId, onItemClick } = props;

  // @todo document html parameter later after proper tests
  const html = useMemo(() => (item.html ? sanitizeHtml(item.html) : ""), [item.html]);
  const [collapsible, collapsedMap, toggleCollapsed] = useContext(CollapsedContext);
  const collapsed = collapsedMap[item.id] ?? false;
  const toggle = collapsible ? () => toggleCollapsed(item.id, !collapsed) : undefined;
  const classNames = [styles.item, "htx-ranker-item"];

  if (collapsible) classNames.push(collapsed ? styles.collapsed : styles.expanded);

  // Handle item click to move to opposite column
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger on title click (for collapse/expand)
    if ((e.target as HTMLElement).closest(`.${styles.itemTitle}`)) {
      return;
    }
    
    if (onItemClick && columnId) {
      onItemClick(item.id, columnId);
    }
  }, [onItemClick, item.id, columnId]);

  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={readonly}>
      {(provided) => {
        return (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ 
              ...provided.draggableProps.style,
              cursor: readonly ? 'default' : 'pointer'
            }}
            className={classNames.join(" ")}
            ref={provided.innerRef}
            data-ranker-id={item.id}
            onClick={handleClick}
          >
            {item.title && (
              <h3 className={styles.itemTitle} onClick={toggle}>
                {item.title}
              </h3>
            )}
            {item.body && <p className={styles.itemLine}>{item.body}</p>}
            {item.html && <p className={styles.itemLine} dangerouslySetInnerHTML={{ __html: html }} />}
            <p className={styles.itemLine}>{item.id}</p>
          </div>
        );
      }}
    </Draggable>
  );
};

export default Item;
