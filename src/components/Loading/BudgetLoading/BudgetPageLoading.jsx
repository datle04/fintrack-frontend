import React from "react";

const SkeletonBox = ({ className = "" }) => (
  <div
    className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`}
  />
);

const BudgetPageLoading = () => {
  return (
    <section className="w-full min-h-screen bg-[#F5F6FA] dark:bg-[#35363A] p-4 md:p-6 xl:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-auto flex flex-col gap-2">
          <SkeletonBox className="w-32 h-8" />
          <SkeletonBox className="w-48 h-4" />
        </div>

        {/* Toolbar (Selects + Buttons) */}
        <div className="w-full md:w-auto flex items-center gap-3 bg-white dark:bg-[#2E2E33] p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[46px]">
          <SkeletonBox className="w-24 h-6 mx-2" />
          <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-600"></div>
          <SkeletonBox className="w-16 h-6 mx-2" />
          <SkeletonBox className="w-20 h-8 rounded-lg" />
        </div>
      </div>

      {/* --- SUMMARY CARD SKELETON (Thẻ Tổng quan) --- */}
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
          <div className="flex items-center gap-2">
            <SkeletonBox className="w-8 h-8 rounded-lg" />
            <SkeletonBox className="w-32 h-5" />
          </div>

          <SkeletonBox className="w-48 h-10 md:h-12" />

          <div className="flex gap-4 w-full md:max-w-md">
            <SkeletonBox className="flex-1 h-20 rounded-xl" />
            <SkeletonBox className="flex-1 h-20 rounded-xl" />
          </div>
        </div>

        <div className="relative shrink-0">
          <SkeletonBox className="w-40 h-40 rounded-full border-4 border-slate-100 dark:border-slate-800" />
        </div>
      </div>

      {/* --- CATEGORY LIST SKELETON (Chi tiết danh mục) --- */}
      <div>
        <SkeletonBox className="w-40 h-6 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="w-full bg-white dark:bg-[#2E2E33] p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4"
            >
              <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />

              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <SkeletonBox className="w-24 h-4" />
                  <SkeletonBox className="w-20 h-4" />
                </div>
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
