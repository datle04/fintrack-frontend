import React from "react";

// Component Skeleton cơ bản
const SkeletonBox = ({ className = "" }) => (
  <div
    className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`}
  />
);

const BudgetPageLoading = () => {
  return (
    <section className="w-full min-h-screen bg-[#F5F6FA] dark:bg-[#35363A] p-4 md:p-6 xl:p-8">
      {/* --- 1. TOOLBAR SKELETON (Header) --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Title & Subtitle */}
        <div className="w-full md:w-auto flex flex-col gap-2">
          <SkeletonBox className="w-32 h-8" /> {/* Title */}
          <SkeletonBox className="w-48 h-4" /> {/* Subtitle */}
        </div>

        {/* Toolbar (Selects + Buttons) */}
        <div className="w-full md:w-auto flex items-center gap-3 bg-white dark:bg-[#2E2E33] p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[46px]">
          <SkeletonBox className="w-24 h-6 mx-2" /> {/* Month Select */}
          <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-600"></div>
          <SkeletonBox className="w-16 h-6 mx-2" /> {/* Year Select */}
          <SkeletonBox className="w-20 h-8 rounded-lg" /> {/* Action Button */}
        </div>
      </div>

      {/* --- 2. SUMMARY CARD SKELETON (Thẻ Tổng quan) --- */}
      <div
        className="
          relative overflow-hidden 
          bg-white dark:bg-[#2E2E33] 
          rounded-3xl p-6 md:p-8 
          mb-8 
          flex flex-col md:flex-row items-center justify-between gap-8
          border border-gray-200 dark:border-gray-700
        "
      >
        {/* Left Side: Text Info */}
        <div className="flex-1 w-full space-y-6">
          {/* Label */}
          <div className="flex items-center gap-2">
            <SkeletonBox className="w-8 h-8 rounded-lg" />
            <SkeletonBox className="w-32 h-5" />
          </div>

          {/* Big Number (Available Budget) */}
          <SkeletonBox className="w-48 h-10 md:h-12" />

          {/* Small Boxes (Total & Spent) */}
          <div className="flex gap-4 w-full md:max-w-md">
            <SkeletonBox className="flex-1 h-20 rounded-xl" />
            <SkeletonBox className="flex-1 h-20 rounded-xl" />
          </div>
        </div>

        {/* Right Side: Chart Circle */}
        <div className="relative shrink-0">
          {/* Vòng tròn biểu đồ */}
          <SkeletonBox className="w-40 h-40 rounded-full border-4 border-slate-100 dark:border-slate-800" />
        </div>
      </div>

      {/* --- 3. CATEGORY LIST SKELETON (Chi tiết danh mục) --- */}
      <div>
        <SkeletonBox className="w-40 h-6 mb-4" /> {/* Title Section */}
        <div className="space-y-3">
          {/* Giả lập 3-4 dòng category items */}
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="w-full bg-white dark:bg-[#2E2E33] p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4"
            >
              {/* Icon */}
              <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />

              <div className="flex-1 flex flex-col gap-2">
                {/* Row 1: Name & Amount */}
                <div className="flex justify-between items-center">
                  <SkeletonBox className="w-24 h-4" /> {/* Category Name */}
                  <SkeletonBox className="w-20 h-4" /> {/* Amount */}
                </div>
                {/* Row 2: Progress Bar */}
                <SkeletonBox className="w-full h-2 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BudgetPageLoading;
