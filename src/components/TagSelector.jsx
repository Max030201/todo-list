import React from "react";

const TAG_COLORS = {
  red: "bg-red-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
};

const TagSelector = ({ selectedTag, onTagSelect }) => {
  return (
    <div className="flex flex-wrap items-center justify-start gap-2">
      <button
        onClick={() => onTagSelect(null)}
        className={`px-3 py-1 rounded-full text-black font-medium ${
          selectedTag === null ? "ring-2 ring-black" : "bg-gray-200"
        }`}
        data-testid="tag-all"
      >
        Все
      </button>
      {Object.entries(TAG_COLORS).map(([color, bgClass]) => (
        <button
          key={color}
          onClick={() => onTagSelect(color)}
          className={`px-3 py-1 rounded-full text-black font-medium ${bgClass} ${
            selectedTag === color ? "ring-2 ring-black" : ""
          }`}
          data-testid={`tag-${color}`}
        >
          {color}
        </button>
      ))}
    </div>
  );
};

export default TagSelector;
