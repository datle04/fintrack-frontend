import React from "react";

const SkeletonBox = ({ className = "" }) => (
  <div
    className={`bg-slate-200 dark:bg-slate-700 animate-pulse rounded ${className}`}
  />
);

const TransactionPageLoading = () => {
  return (
    <main className="min-h-screen w-full bg-[#F5F6FA] 2xl:px-6 2xl:py-2 3xl:px-8 3xl:py-2 dark:bg-[#35363A]">
      <section className="flex flex-col gap-2 bg-[#F5F6FA] 2xl:p-6 3xl:p-8 rounded-md dark:bg-[#35363A]">
        <div className="my-1 flex flex-col justify-center bg-white dark:bg-[#2E2E33] p-4 rounded shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
            <SkeletonBox className="h-11 w-full rounded-lg" />{" "}
            <SkeletonBox className="h-11 w-full md:w-32 rounded-lg" />{" "}
          </div>

          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
            <div className="flex items-center gap-2 p-1">
              <SkeletonBox className="h-9 w-32" />
              <div className="w-4 h-1 bg-slate-200 dark:bg-slate-700"></div>
              <SkeletonBox className="h-9 w-32" />
            </div>

            <div className="flex flex-1 gap-4 w-full overflow-x-auto">
              <SkeletonBox className="h-10 w-32 md:w-40" />
              <SkeletonBox className="h-10 w-40 md:w-48" />
              <SkeletonBox className="h-10 w-24" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white shadow-sm border border-slate-200 mt-2 rounded-md p-4 2xl:p-6 flex justify-between items-center dark:bg-[#2E2E33] dark:border-slate-700">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between">
            <SkeletonBox className="w-24 h-4" />
            <SkeletonBox className="w-28 h-4" />
          </div>
          <div className="flex justify-between">
            <SkeletonBox className="w-24 h-4" />
            <SkeletonBox className="w-28 h-4" />
          </div>
          <hr className="border-t border-slate-200 dark:border-slate-600 my-1" />
          <div className="flex justify-between mt-1">
            <SkeletonBox className="w-28 h-5" />
            <SkeletonBox className="w-32 h-5" />
          </div>
        </div>

        <div className="w-[1px] h-24 bg-gray-200 dark:bg-slate-600 mx-6 self-stretch" />
        <div className="flex flex-col justify-center gap-2">
          <SkeletonBox className="w-32 h-4" />
          <SkeletonBox className="w-16 h-8 self-end" />
        </div>
      </section>

      <section className="bg-white rounded-md shadow p-4 mt-2 dark:bg-[#2E2E33] dark:border dark:border-slate-700">
        <div className="mt-2 space-y-6">
          {[...Array(3)].map((_, groupIdx) => (
            <div
              key={groupIdx}
              className="bg-white dark:bg-[#2E2E33] rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="bg-gray-50 dark:bg-[#3a3a41] px-4 py-3 border-b border-gray-100 dark:border-slate-600 flex justify-between items-center">
                <SkeletonBox className="w-32 h-5" />
                <SkeletonBox className="w-20 h-4" />
              </div>
              <div className="divide-y divide-gray-50 dark:divide-slate-700">
                {[...Array(3)].map((_, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <SkeletonBox className="w-10 h-10 rounded-full" />
                      <div className="flex flex-col gap-2">
                        <SkeletonBox className="w-32 h-4" />
                        <SkeletonBox className="w-48 h-3" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <SkeletonBox className="w-24 h-5" />
                      <div className="hidden md:flex gap-2">
                        <SkeletonBox className="w-8 h-8 rounded-full" />
                        <SkeletonBox className="w-8 h-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default TransactionPageLoading;
