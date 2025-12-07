import React from "react";

// Component Skeleton cơ bản (Dùng chung cho cả App)
const SkeletonBox = ({ className = "" }) => (
  <div
    className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`}
  />
);

const SettingPageLoading = () => {
  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#35363A] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <SkeletonBox className="w-48 h-8 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- CỘT TRÁI: SIDEBAR SKELETON (4 cols) --- */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Profile Summary Card */}
            <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center">
              {/* Avatar Circle */}
              <SkeletonBox className="w-24 h-24 rounded-full mb-4" />
              {/* Name */}
              <SkeletonBox className="w-40 h-7 mb-2" />
              {/* Email */}
              <SkeletonBox className="w-56 h-4" />
            </div>

            {/* 2. Navigation Menu */}
            <div className="bg-white dark:bg-[#2E2E33] rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-700">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <SkeletonBox className="w-6 h-6 rounded-full" />{" "}
                    {/* Icon */}
                    <SkeletonBox className="w-32 h-5" /> {/* Label */}
                  </div>
                  <SkeletonBox className="w-4 h-4" /> {/* Arrow */}
                </div>
              ))}
            </div>
          </div>

          {/* --- CỘT PHẢI: CONTENT FORM SKELETON (8 cols) --- */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700">
              {/* Section Header */}
              <div className="mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
                <SkeletonBox className="w-48 h-7" />
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Giả lập 6 trường input */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={i === 5 ? "md:col-span-2" : ""}>
                    <SkeletonBox className="w-24 h-4 mb-2" /> {/* Label */}
                    <SkeletonBox className="w-full h-11 rounded-lg" />
                    {/* Input Box */}
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <SkeletonBox className="w-32 h-11 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPageLoading;
