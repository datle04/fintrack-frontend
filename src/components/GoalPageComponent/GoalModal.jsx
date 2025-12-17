import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { createGoal, updateGoal } from "../../features/goalSlice";
import { currencyMap } from "../../constant/currencies";
import { getDirtyValues } from "../../utils/formUtils";
import {
  X,
  Target,
  Calendar,
  FileText,
  Wallet,
  CheckCircle,
} from "lucide-react"; // Import Icons

const GoalModal = ({ goal, onClose, t }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [initialValues, setInitialValues] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    targetCurrency: "VND",
    targetOriginalAmount: "",
    targetDate: "",
    description: "",
  });

  // --- LOGIC GIỮ NGUYÊN ---
  useEffect(() => {
    if (goal) {
      const initData = {
        name: goal.name,
        targetCurrency: goal.targetCurrency || "VND",
        targetOriginalAmount: goal.targetOriginalAmount,
        targetDate: goal.targetDate
          ? dayjs(goal.targetDate).format("YYYY-MM-DD")
          : "",
        description: goal.description || "",
      };
      setInitialValues(initData);
      setFormData(initData);
    } else {
      setFormData({
        name: "",
        targetCurrency: "VND",
        targetOriginalAmount: "",
        targetDate: "",
        description: "",
      });
      setInitialValues(null);
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const now = dayjs();

    if (!formData.name.trim()) newErrors.name = t("validate.nameRequired");
    if (
      !formData.targetOriginalAmount ||
      Number(formData.targetOriginalAmount) <= 0
    ) {
      newErrors.targetOriginalAmount = t("validate.amountPositive");
    }
    if (!formData.targetDate) {
      newErrors.targetDate = t("validate.dateRequired");
    } else {
      const selectedDate = dayjs(formData.targetDate);
      if (selectedDate.isBefore(now, "day")) {
        newErrors.targetDate = t("validate.futureDate");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let payload;
    if (goal) {
      const dirtyFields = getDirtyValues(initialValues, formData);
      if (Object.keys(dirtyFields).length === 0) {
        toast.info(t("info.noChanges") || "Bạn chưa thay đổi thông tin nào!");
        onClose();
        return;
      }
      payload = { ...dirtyFields };
      if (payload.targetOriginalAmount !== undefined) {
        payload.targetOriginalAmount = Number(payload.targetOriginalAmount);
      }
    } else {
      payload = {
        ...formData,
        targetOriginalAmount: Number(formData.targetOriginalAmount),
      };
    }

    const actionPromise = goal
      ? dispatch(updateGoal({ id: goal._id, formData: payload })).unwrap()
      : dispatch(createGoal(payload)).unwrap();

    toast
      .promise(actionPromise, {
        loading: goal
          ? t("goalPage.toast.updatingGoal")
          : t("goalPage.toast.creating"),
        success: goal
          ? t("goalPage.toast.updateSuccess")
          : t("goalPage.toast.createSuccess"),
        error: (err) => err?.message || "Lỗi khi lưu mục tiêu.",
      })
      .then(() => onClose())
      .catch(() => {});
  };

  // --- STYLES ---
  const inputContainerClass = (hasError) => `
    flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200
    ${
      hasError
        ? "border-red-500 bg-red-50 focus-within:ring-2 focus-within:ring-red-200"
        : "border-gray-200 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent dark:bg-[#3a3a41] dark:border-gray-600 dark:text-white"
    }
  `;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E1E24] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                goal
                  ? "bg-blue-100 text-blue-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              <Target size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {goal ? t("editGoal") : t("addGoal")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {goal
                  ? "Cập nhật thông tin mục tiêu"
                  : "Đặt mục tiêu tài chính mới"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          {/* 1. HERO INPUT: Target Amount & Currency */}
          <div
            className={`p-4 rounded-xl border ${
              errors.targetOriginalAmount
                ? "border-red-200 bg-red-50"
                : "border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-800"
            }`}
          >
            <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              {t("targetAmount")} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  name="targetOriginalAmount"
                  value={formData.targetOriginalAmount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full text-2xl font-bold bg-transparent border-b-2 border-indigo-200 dark:border-indigo-700 focus:border-indigo-500 outline-none px-2 py-1 text-gray-900 dark:text-white placeholder-indigo-200 transition-colors"
                />
              </div>
              <div className="w-24">
                <select
                  name="targetCurrency"
                  value={formData.targetCurrency}
                  onChange={handleChange}
                  disabled={!!goal}
                  className={`w-full bg-white dark:bg-[#2E2E33] border border-indigo-200 dark:border-gray-600 rounded-lg px-2 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer ${
                    !!goal ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {[...currencyMap].map(([code]) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {errors.targetOriginalAmount && (
              <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                <Wallet size={12} /> {errors.targetOriginalAmount}
              </p>
            )}
          </div>

          {/* 2. Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t("goalName")} <span className="text-red-500">*</span>
            </label>
            <div className={inputContainerClass(errors.name)}>
              <Target className="text-gray-400" size={18} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Mua nhà, Du lịch Nhật Bản..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>
            )}
          </div>

          {/* 3. Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t("targetDate")} <span className="text-red-500">*</span>
            </label>
            <div className={inputContainerClass(errors.targetDate)}>
              <Calendar className="text-gray-400" size={18} />
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm font-medium"
              />
            </div>
            {errors.targetDate && (
              <p className="text-red-500 text-xs mt-1 ml-1">
                {errors.targetDate}
              </p>
            )}
          </div>

          {/* 4. Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t("description")}
            </label>
            <div
              className={`flex gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent dark:bg-[#3a3a41] dark:border-gray-600`}
            >
              <FileText className="text-gray-400 mt-0.5" size={18} />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Ghi chú thêm về kế hoạch này..."
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/5"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 flex items-center gap-2"
          >
            <CheckCircle size={18} />
            {t("saveGoal")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
