import React from "react";

const SkeletonBox = ({ className = "" }) => (
  <div
    className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`}
  />
);

const SettingPageLoading = () => {
  return (
    <div className="min-h-screen bg-[#F5F6FA] dark:bg-[#35363A] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <SkeletonBox className="w-48 h-8 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center">
              <SkeletonBox className="w-24 h-24 rounded-full mb-4" />
              <SkeletonBox className="w-40 h-7 mb-2" />
              <SkeletonBox className="w-56 h-4" />
            </div>

            {/* Navigation Menu */}
            <div className="bg-white dark:bg-[#2E2E33] rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-700">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <SkeletonBox className="w-6 h-6 rounded-full" />{" "}
                    <SkeletonBox className="w-32 h-5" />
                  </div>
                  <SkeletonBox className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          {/* --- CONTENT FORM SKELETON --- */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#2E2E33] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
                <SkeletonBox className="w-48 h-7" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={i === 5 ? "md:col-span-2" : ""}>
                    <SkeletonBox className="w-24 h-4 mb-2" />
                    <SkeletonBox className="w-full h-11 rounded-lg" />
                  </div>
                ))}
              </div>

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
