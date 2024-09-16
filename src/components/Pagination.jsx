import React from "react";
import DroppablePage from "./DroppablePage.jsx";

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const pageCount = Math.ceil(totalItems / itemsPerPage);
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {pages.map((page) => (
        <DroppablePage key={page} page={page}>
          <button
            onClick={() => onPageChange(page)}
            data-pagination-button="true"
            data-page-number={page}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 relative border-none
              ${currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
            `}
            data-testid={`page-${page}`}
          >
            {page}
          </button>
        </DroppablePage>
      ))}
    </div>
  );
};

export default Pagination;
