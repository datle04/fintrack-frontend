import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6FA] dark:bg-[#2B2B2F] px-4 text-center">
      <h1 className="text-9xl font-extrabold text-indigo-200 dark:text-indigo-900/50 select-none">
        404
      </h1>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa.
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
