import { useState } from "react";
import { useDispatch } from "react-redux";
import InputField from "./InputField"; // Giả sử InputField của bạn chấp nhận props className hoặc style
import TextAreaField from "./TextAreaField";
import { currencyMap } from "../../constant/currencies";
import toast from "react-hot-toast";
import { createGoal, updateGoal } from "../../features/goalSlice";
import dayjs from "dayjs";
import { getDirtyValues } from "../../utils/formUtils";

// --- Goal Modal Component ---
const GoalModal = ({ goal, onClose, t }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});

  // 1️⃣ THÊM STATE LƯU GIÁ TRỊ GỐC
  const [initialValues, setInitialValues] = useState(null);

  // State Form (Khởi tạo rỗng trước, sẽ được useEffect điền dữ liệu)
  const [formData, setFormData] = useState({
    name: "",
    targetCurrency: "VND",
    targetOriginalAmount: "",
    targetDate: "",
    description: "",
  });

  // 2️⃣ USE EFFECT: Chuẩn hóa dữ liệu đầu vào
  // Logic này quan trọng để getDirtyValues hoạt động đúng (đặc biệt là Date)
  useEffect(() => {
    if (goal) {
      const initData = {
        name: goal.name,
        targetCurrency: goal.targetCurrency || "VND",
        // Đảm bảo là số hoặc chuỗi số để so sánh
        targetOriginalAmount: goal.targetOriginalAmount,
        // Format ngày tháng về YYYY-MM-DD để khớp với input type="date"
        targetDate: goal.targetDate
          ? dayjs(goal.targetDate).format("YYYY-MM-DD")
          : "",
        description: goal.description || "",
      };

      setInitialValues(initData);
      setFormData(initData);
    } else {
      // Logic cho trường hợp Thêm mới (Reset form)
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
    // ... Giữ nguyên code cũ
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
    // ... Giữ nguyên code cũ
    // Logic validate vẫn phải check trên formData hiện tại
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

  // 3️⃣ CẬP NHẬT HANDLESUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    // Bước 1: Validate form hiện tại (Bắt buộc cho cả Thêm và Sửa)
    if (!validateForm()) return;

    let payload;

    // =================================================
    // TRƯỜNG HỢP SỬA (UPDATE) - Dùng Diffing
    // =================================================
    if (goal) {
      // Lấy ra các trường thay đổi
      const dirtyFields = getDirtyValues(initialValues, formData);

      // Nếu không có gì thay đổi -> Thông báo và đóng
      if (Object.keys(dirtyFields).length === 0) {
        toast.info(t("info.noChanges") || "Bạn chưa thay đổi thông tin nào!");
        onClose();
        return;
      }

      // Chuẩn bị payload chỉ chứa các trường thay đổi
      payload = { ...dirtyFields };

      // Quan trọng: Nếu targetOriginalAmount có thay đổi, đảm bảo nó là Number
      if (payload.targetOriginalAmount !== undefined) {
        payload.targetOriginalAmount = Number(payload.targetOriginalAmount);
      }
    }

    // =================================================
    // TRƯỜNG HỢP THÊM (CREATE) - Gửi hết
    // =================================================
    else {
      payload = {
        ...formData,
        targetOriginalAmount: Number(formData.targetOriginalAmount),
      };
    }

    // Gọi API
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
