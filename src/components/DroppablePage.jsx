import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DroppablePage = ({ page, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-page-${page}`,
    data: {
      page: page,
    },
  });

  const style = {
    transition: "background-color 0.2s ease",
    backgroundColor: isOver ? "#e0e0e0" : undefined,
  };

  const childWithDroppable = React.cloneElement(children, {
    ref: setNodeRef,
    style: { ...(children.props?.style || {}), ...style },
    "data-page": page,
  });

  return (
    <div className="rounded-md">
      {childWithDroppable}
    </div>
  );
};

export default DroppablePage;
