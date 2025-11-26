import { useState } from "react";
import { useDispatch } from "react-redux";
import InputField from "./InputField"; // Giả sử InputField của bạn chấp nhận props className hoặc style
import TextAreaField from "./TextAreaField";
import { currencyMap } from "../../utils/currencies";
import toast from "react-hot-toast";
import { createGoal, updateGoal } from "../../features/goalSlice";
import dayjs from "dayjs";

// --- Goal Modal Component ---
const GoalModal = ({ goal, onClose, t }) => {
  const dispatch = useDispatch();

  // 1. State lưu lỗi
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: goal?.name || "",
    targetCurrency: goal?.targetCurrency || "VND",
    targetOriginalAmount: goal?.targetOriginalAmount || "",
    targetDate: goal?.targetDate
      ? dayjs(goal.targetDate).format("YYYY-MM-DD")
      : "",
    description: goal?.description || "",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // 2. Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // 3. Hàm Validate
  const validateForm = () => {
    const newErrors = {};
    const now = dayjs();

    // Validate Tên
    if (!formData.name.trim()) {
      newErrors.name =
        t("validate.nameRequired") || "Vui lòng nhập tên mục tiêu";
    }

    // Validate Số tiền
    if (
      !formData.targetOriginalAmount ||
      Number(formData.targetOriginalAmount) <= 0
    ) {
      newErrors.targetOriginalAmount =
        t("validate.amountPositive") || "Số tiền phải lớn hơn 0";
    }

    // Validate Ngày tháng
    if (!formData.targetDate) {
      newErrors.targetDate = t("validate.dateRequired") || "Vui lòng chọn ngày";
    } else {
      const selectedDate = dayjs(formData.targetDate);
      // Ngày mục tiêu phải là tương lai (lớn hơn ngày hiện tại)
      if (selectedDate.isBefore(now, "day")) {
        newErrors.targetDate =
          t("validate.futureDate") || "Ngày mục tiêu phải ở trong tương lai";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 4. Gọi validate trước khi submit
    if (!validateForm()) {
      // toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    const payload = {
      ...formData,
      targetOriginalAmount: Number(formData.targetOriginalAmount),
    };

    const actionPromise = goal
      ? dispatch(updateGoal({ id: goal._id, formData: payload })).unwrap()
      : dispatch(createGoal(payload)).unwrap();

    toast
      .promise(actionPromise, {
        loading: goal
          ? "Đang cập nhật mục tiêu..."
          : "Đang tạo mục tiêu mới...",
        success: goal
          ? "Cập nhật mục tiêu thành công!"
          : "Đã tạo mục tiêu thành công!",
        error: (err) => err?.message || "Lỗi khi lưu mục tiêu.",
      })
      .then(() => {
        onClose();
      })
      .catch(() => {});
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl dark:bg-[#2E2E33] dark:text-white/83 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-4 dark:text-white/90">
          {goal
            ? t("editGoal") || "Chỉnh sửa mục tiêu"
            : t("addGoal") || "Thêm mục tiêu"}
        </h2>

        <div className="space-y-4">
          {/* Tên mục tiêu */}
          <div>
            <InputField
              label={t("goalName")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              // Truyền class lỗi vào InputField (nếu component hỗ trợ) hoặc render bên ngoài
              className={errors.name ? "border-red-500 focus:ring-red-200" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>
            )}
          </div>

          {/* Currency */}
          <div className="w-full">
            <label className="block text-sm font-medium">{t("currency")}</label>
            <select
              name="targetCurrency"
              value={formData.targetCurrency}
              onChange={handleChange}
              disabled={!!goal}
              className={`w-full border p-2 rounded-lg outline-none dark:bg-[#3A3B3C] dark:border-slate-600 ${
                !!goal
                  ? "cursor-not-allowed opacity-60 bg-gray-100 dark:bg-gray-700"
                  : "cursor-pointer"
              } ${/* Không cần validate currency vì luôn có default */ ""}`}
            >
              {[...currencyMap].map(([code, label]) => (
                <option key={code} value={code} className="dark:bg-[#2E2E33]">
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Số tiền mục tiêu */}
          <div>
            <InputField
              goal={goal}
              label={t("targetAmount")}
              name="targetOriginalAmount"
              value={formData.targetOriginalAmount}
              onChange={handleChange}
              type="number"
              min={0}
              className={
                errors.targetOriginalAmount
                  ? "border-red-500 focus:ring-red-200"
                  : ""
              }
            />
            {errors.targetOriginalAmount && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.targetOriginalAmount}
              </p>
            )}
          </div>

          {/* Ngày mục tiêu */}
          <div>
            <InputField
              label={t("targetDate")}
              name="targetDate"
              value={formData.targetDate}
              onChange={handleChange}
              type="date"
              className={
                errors.targetDate ? "border-red-500 focus:ring-red-200" : ""
              }
            />
            {errors.targetDate && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.targetDate}
              </p>
            )}
          </div>

          {/* Mô tả */}
          <TextAreaField
            label={t("description")}
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            {t("saveGoal")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalModal;
