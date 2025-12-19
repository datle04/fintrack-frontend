import React from "react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  const visiblePages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2));

  return (
    <div className="flex justify-center mt-6 gap-2 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 border border-slate-400 text-gray-700 rounded disabled:opacity-50 cursor-pointer transition-all hover:bg-blue-100"
      >
        Prev
      </button>

      {visiblePages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 border rounded cursor-pointer transition-all ${
            p === page
              ? "bg-blue-500 text-white"
              : "hover:bg-blue-100 border-slate-400 text-gray-700"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 border border-slate-400 text-gray-700 rounded disabled:opacity-50 cursor-pointer transition-all hover:bg-blue-100"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
