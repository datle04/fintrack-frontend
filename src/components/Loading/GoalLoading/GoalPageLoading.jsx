// src/pages/GoalPageLoading.jsx
import React from "react";

// Component Skeleton cơ bản (Dùng chung với BudgetPageLoading nếu có thể)
const SkeletonBox = ({ className = "" }) => (
  <div
    className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`}
  />
);

const GoalPageLoading = () => {
  // Lặp lại 6 mục tiêu giả để điền vào grid
  const skeletonGoals = [...Array(6)];

  return (
    <div className="p-4 sm:p-6 bg-[#f5f6fa] min-h-screen dark:bg-[#35363A]">
      {/* Header Loading: Button Add */}
      <header className="flex justify-end items-center mb-6">
        <SkeletonBox className="w-24 h-10 rounded-lg" />
      </header>

      {/* Grid Loading: Mô phỏng Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonGoals.map((_, index) => (
          // Mô phỏng GoalCard
          <div
            key={index}
            className="bg-white dark:bg-[#2E2E33] p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-4 h-full"
          >
            {/* Header: Name & Edit/Delete Button */}
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-200 dark:border-gray-700">
              <SkeletonBox className="w-3/5 h-6" /> {/* Goal Name */}
              <div className="flex gap-2">
                <SkeletonBox className="w-8 h-8 rounded-full" />
                <SkeletonBox className="w-8 h-8 rounded-full" />
              </div>
            </div>

            {/* Progress Circle & Status */}
            <div className="flex items-center gap-4">
              {/* Circle */}
              <SkeletonBox className="w-16 h-16 rounded-full shrink-0" />

              {/* Status/Amounts */}
              <div className="flex-1 space-y-2">
                <SkeletonBox className="w-full h-4" /> {/* Current Amount */}
                <SkeletonBox className="w-4/5 h-4" /> {/* Target Amount */}
              </div>
            </div>

            {/* Deadline & Footer Action */}
            <div className="pt-2 space-y-3">
              <SkeletonBox className="w-1/2 h-4" /> {/* Deadline */}
              {/* Progress Bar */}
              <SkeletonBox className="w-full h-2 rounded-full" />
              {/* Footer Button (Contribute) */}
              <div className="flex justify-end pt-2">
                <SkeletonBox className="w-32 h-9 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalPageLoading;
