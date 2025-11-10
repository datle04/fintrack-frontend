import { useState } from "react";
import { useDispatch } from "react-redux";
import InputField from "./InputField";
import TextAreaField from "./TextAreaField";
import { currencyMap } from "../../utils/currencies";
import toast from "react-hot-toast";
import { createGoal, updateGoal } from "../../features/goalSlice";
import dayjs from "dayjs";

// --- Goal Modal Component ---
const GoalModal = ({ goal, onClose, t }) => {
  const dispatch = useDispatch();
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    console.log(formData.targetCurrency);
    e.preventDefault();
    const payload = {
      ...formData,
      targetOriginalAmount: Number(formData.targetOriginalAmount),
    };

    if (goal) {
      toast
        .promise(
          dispatch(updateGoal({ id: goal._id, formData: payload })).unwrap(),
          {
            loading: "Đang cập nhật mục tiêu...",
            success: "Cập nhật mục tiêu thành công!",
            error: "Lỗi khi cập nhật mục tiêu.",
          }
        )
        .then(onClose);
    } else {
      toast
        .promise(dispatch(createGoal(payload)).unwrap(), {
          loading: "Đang tạo mục tiêu mới...",
          success: "Đã tạo mục tiêu thành công!",
          error: "Lỗi khi tạo mục tiêu.",
        })
        .then(onClose);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl dark:bg-[#2E2E33] dark:text-white/83"
      >
        <h2 className="text-2xl font-bold mb-4 dark:text-white/90">
          {goal
            ? t("editGoal") || "Chỉnh sửa mục tiêu"
            : t("addGoal") || "Thêm mục tiêu"}
        </h2>

        <div className="space-y-4">
          <InputField
            label={t("goalName")}
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <div className="w-full">
            <label className="block text-sm font-medium">{t("currency")}</label>
            <select
              name="targetCurrency"
              value={formData.targetCurrency} // 1. Đã sửa lỗi
              onChange={handleChange}
              disabled={!!goal} // 2. Thêm 'disabled' khi goal tồn tại
              className={`w-full border border-gray-300 p-2 rounded-lg outline-none dark:bg-[#3A3B3C] dark:border-slate-600] ${
                !!goal
                  ? "cursor-not-allowed opacity-60 bg-gray-100 dark:bg-gray-700" // 3. Thêm style khi bị vô hiệu hóa
                  : "cursor-pointer"
              }`}
            >
              {[...currencyMap].map(([code, label]) => (
                <option key={code} value={code} className="dark:bg-[#2E2E33]">
                  {label}
                </option>
              ))}
            </select>
          </div>
          <InputField
            goal={goal}
            label={t("targetAmount")}
            name="targetOriginalAmount"
            value={formData.targetOriginalAmount}
            onChange={handleChange}
            type="number"
            required
            min={0}
          />
          <InputField
            label={t("targetDate")}
            name="targetDate"
            value={formData.targetDate}
            onChange={handleChange}
            type="date"
            required
          />
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
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700"
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
