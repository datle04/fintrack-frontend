import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { FaEdit, FaTrash, FaTimes, FaFilter } from "react-icons/fa";
import { currencyMap } from "../../constant/currencies";
import { categoryList, getCategoryMeta } from "../../constant/categoryList";
import { useTranslation } from "react-i18next";
import { updateAdminBudget } from "../../features/adminBudgetSlice";

const EditBudgetModal = ({ budget, onClose }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    originalCurrency: budget.originalCurrency,
    originalAmount: budget.originalAmount,
    month: budget.month,
    year: budget.year,
    categories: budget.categories,
    reason: "",
  });
  // Bạn có thể mở rộng để sửa từng danh mục con nếu cần

  useEffect(() => {
    console.log(budget);
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (index, key, value) => {
    setFormData((prev) => {
      const updatedCategories = [...prev.categories];
      updatedCategories[index] = {
        ...updatedCategories[index],
        [key]: value,
      };
      return {
        ...prev,
        categories: updatedCategories,
      };
    });
  };

  const handleRemoveCategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reason) {
      toast.error("Vui lòng nhập lý do cập nhật.");
      return;
    }

    // Gọi API PUT /admin/budgets/:budgetId
    const savePromise = dispatch(
      updateAdminBudget({
        budgetId: budget._id,
        data: formData,
      })
    );

    toast.promise(savePromise, {
      loading: "Đang lưu thay đổi...",
      success: () => {
        onClose();
        return "Cập nhật ngân sách thành công!";
      },
      error: (err) => err.response?.data?.message || "Cập nhật thất bại!",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="h-full max-h-[95%] overflow-y-scroll bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Sửa Ngân sách (Tháng {budget.month}/{budget.year})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">User: {budget.user.name}</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Tổng ngân sách
            </label>
            <input
              type="number"
              name="originalAmount"
              value={formData.originalAmount}
              onChange={handleOnChange}
              className="w-full my-1 border outline-none border-slate-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Tháng
            </label>
            <input
              type="number"
              name="month"
              value={formData.month}
              onChange={handleOnChange}
              className="w-full my-1 border outline-none border-slate-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Năm
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleOnChange}
              className="w-full my-1 border outline-none border-slate-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Đơn vị tiền
            </label>
            <select
              name="originalCurrency"
              value={formData.originalCurrency}
              onChange={handleOnChange}
              className="w-full my-1 border border-slate-300 px-3 py-2 rounded outline-none cursor-pointer dark:focus:outline-slate-700 dark:bg-[#2E2E33]"
            >
              {[...currencyMap].map(([code, label]) => (
                <option key={code} value={code} className="dark:bg-[#2E2E33]">
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục con
            </label>

            <div className="grid grid-cols-2 gap-3 font-semibold text-sm mb-1">
              <span>Danh mục</span>
              <span>Số tiền</span>
            </div>

            {formData.categories.map((cat, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-2 mb-2 items-center bg-gray-50 py-1 rounded-md"
              >
                <select
                  value={cat.category}
                  onChange={(e) =>
                    handleCategoryChange(index, "category", e.target.value)
                  }
                  className="w-full p-2 border border-slate-300 outline-none rounded cursor-pointer dark:bg-[#2E2E33] dark:border-slate-700 dark:text-white/83"
                >
                  {categoryList.map((item) => {
                    const { icon } = getCategoryMeta(item.key);
                    return (
                      <option key={item.key} value={item.key}>
                        {icon} {t(`categories.${item.key}`)}
                      </option>
                    );
                  })}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={cat.originalAmount}
                    onChange={(e) =>
                      handleCategoryChange(
                        index,
                        "originalAmount",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-slate-300 outline-none rounded dark:bg-[#2E2E33] dark:border-slate-700 dark:text-white/83"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(index)}
                    className="p-2.5 cursor-pointer rounded-full hover:bg-black/10 transition-all"
                  >
                    <FaTrash color="red" size={18} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  categories: [
                    ...prev.categories,
                    { category: "", originalAmount: 0, amount: 0 },
                  ],
                }))
              }
              className="text-blue-600 text-sm hover:underline mt-2 cursor-pointer"
            >
              + Thêm danh mục mới
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Lý do cập nhật (Bắt buộc)
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleOnChange}
              className="w-full my-1 border outline-none border-slate-300 rounded-md px-3 py-2"
              placeholder="Ví dụ: Điều chỉnh theo yêu cầu của user"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md cursor-pointer hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBudgetModal;
