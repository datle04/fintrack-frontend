import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminUpdateTransaction,
  createTransaction,
  updateTransaction,
} from "../features/transactionSlice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { currencyMap } from "../constant/currencies";
import { categoryList } from "../constant/categoryList";
import { getGoals } from "../features/goalSlice";
import { getDirtyValues } from "../utils/formUtils";
import {
  X,
  Wallet,
  Calendar,
  FileText,
  Image as ImageIcon,
  Repeat,
  ShieldAlert,
  Save,
  Trash2,
  Lock,
} from "lucide-react"; // Thêm icons

const now = new Date();

const TransactionModal = ({
  visible,
  onClose,
  transaction,
  goalType,
  goalCategory,
  goalId,
}) => {
  // --- LOGIC GIỮ NGUYÊN ---
  const initialState = {
    type: goalType ? goalType : "income",
    amount: "",
    category: goalCategory ? goalCategory : "",
    note: "",
    date: now.toISOString().slice(0, 10),
    receiptImages: [],
    isRecurring: false,
    recurringDay: now.getDate(),
    currency: "VND",
    goal: goalId ? goalId : "",
    reason: "",
  };

  const user = useSelector((state) => state.auth.user);
  const goals = useSelector((state) => state.goals.goals);
  const { t } = useTranslation(); // Bỏ i18n nếu không dùng trực tiếp
  const dispatch = useDispatch();

  const isAdminEditing = user?.role === "admin" && !!transaction;

  const [formData, setFormData] = useState(initialState);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading cho UI

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date ? transaction.date.slice(0, 10) : "",
        receiptImages: [],
        currency: transaction.currency || "VND",
        reason: "",
      });
      setExistingImages(transaction.receiptImage || []);
    } else {
      setFormData(initialState);
      setExistingImages([]);
    }
    setErrors({});
  }, [transaction]);

  useEffect(() => {
    dispatch(getGoals());
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const selectedFiles = Array.from(files);
      const validFiles = selectedFiles.filter((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} quá lớn (Max 5MB)`);
          return false;
        }
        return true;
      });

      const currentFiles = formData.receiptImages || [];
      const totalFiles = [...currentFiles, ...validFiles];

      const uniqueFiles = totalFiles.reduce((acc, file) => {
        if (!acc.find((f) => f.name === file.name)) acc.push(file);
        return acc;
      }, []);

      if (uniqueFiles.length > 5) {
        toast.error("Bạn chỉ có thể tải lên tối đa 5 ảnh!");
        return;
      }

      setFormData((prev) => ({ ...prev, receiptImages: uniqueFiles }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "category" && value !== "saving") {
        setFormData((prev) => ({ ...prev, goal: "" }));
      }
    }
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      receiptImages: prev.receiptImages.filter((_, i) => i !== indexToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const amountNum = Number(formData.amount);

    if (!formData.amount) {
      newErrors.amount =
        t("validate.amountRequired") || "Vui lòng nhập số tiền";
    } else if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount =
        t("validate.amountPositive") || "Số tiền phải là số lớn hơn 0";
    }

    if (!formData.category) {
      newErrors.category =
        t("validate.categoryRequired") || "Vui lòng chọn danh mục";
    }

    if (formData.category === "saving" && !formData.goal) {
      newErrors.goal =
        t("validate.goalRequired") || "Vui lòng chọn mục tiêu tiết kiệm";
    }

    if (formData.isRecurring) {
      const day = Number(formData.recurringDay);
      if (!day || isNaN(day) || day < 1 || day > 31 || !Number.isInteger(day)) {
        newErrors.recurringDay =
          t("validate.invalidDay") ||
          "Ngày định kỳ phải là số nguyên từ 1 đến 31";
      }
    } else {
      if (!formData.date) {
        newErrors.date = t("validate.dateRequired") || "Vui lòng chọn ngày";
      }
    }

    if (user.role === "admin" && !formData.reason?.trim()) {
      newErrors.reason =
        t("validate.reasonRequired") || "Vui lòng nhập lý do chỉnh sửa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(
        t("validate.checkForm") || "Vui lòng kiểm tra lại thông tin!"
      );
      return;
    }

    const formPayload = new FormData();
    let hasChanges = false;

    if (transaction) {
      // ADMIN LOGIC
      if (user.role === "admin") {
        if (!formData.reason?.trim()) {
          toast.error("Admin bắt buộc phải nhập lý do chỉnh sửa!");
          return;
        }
        formPayload.append("reason", formData.reason);

        if (formData.note !== transaction.note) {
          formPayload.append("note", formData.note);
          hasChanges = true;
        }

        const newFiles = (formData.receiptImages || []).filter(
          (f) => f instanceof File
        );
        const hasNewFiles = newFiles.length > 0;
        const hasDeletedImages =
          (transaction.receiptImage || []).length !== existingImages.length;

        if (hasNewFiles || hasDeletedImages) {
          hasChanges = true;
          newFiles.forEach((file) => formPayload.append("receiptImages", file));
          existingImages.forEach((url) =>
            formPayload.append("existingImages", url)
          );
        }

        if (!hasChanges) {
          toast.info("Admin chỉ được phép sửa Ghi chú hoặc Ảnh chứng từ.");
          return;
        }
      }
      // USER LOGIC
      else {
        const dirtyFields = getDirtyValues(transaction, formData);
        const newFiles = (formData.receiptImages || []).filter(
          (f) => f instanceof File
        );
        const hasNewFiles = newFiles.length > 0;
        const originalImagesCount = (transaction.receiptImage || []).length;
        const currentExistingImagesCount = existingImages.length;
        const hasDeletedImages =
          originalImagesCount !== currentExistingImagesCount;

        if (
          Object.keys(dirtyFields).length === 0 &&
          !hasNewFiles &&
          !hasDeletedImages
        ) {
          toast.info("Bạn chưa thay đổi thông tin nào!");
          onClose();
          return;
        }

        hasChanges = true;
        Object.keys(dirtyFields).forEach((key) => {
          if (
            key === "reason" ||
            key === "receiptImages" ||
            key === "existingImages"
          )
            return;
          let value = dirtyFields[key];
          if (typeof value === "boolean") value = String(value);
          formPayload.append(key, value);
        });

        if (hasNewFiles || hasDeletedImages) {
          newFiles.forEach((file) => formPayload.append("receiptImages", file));
          existingImages.forEach((url) =>
            formPayload.append("existingImages", url)
          );
        }
      }
    } else {
      // CREATE LOGIC
      hasChanges = true;
      formPayload.append("type", formData.type);
      formPayload.append("amount", String(formData.amount));
      formPayload.append("currency", formData.currency);
      formPayload.append("category", formData.category);
      formPayload.append("note", formData.note || "");

      if (formData.date) {
        formPayload.append("date", formData.date);
      } else if (formData.isRecurring) {
        formPayload.append("date", new Date().toISOString());
      }

      formPayload.append("isRecurring", String(formData.isRecurring));
      if (formData.isRecurring) {
        formPayload.append("recurringDay", formData.recurringDay || "1");
      }
      if (formData.goal) formPayload.append("goalId", formData.goal);

      (formData.receiptImages || []).forEach((file) => {
        if (file instanceof File) formPayload.append("receiptImages", file);
      });
    }

    if (!hasChanges) return;

    setIsLoading(true);
    const actionPromise = (async () => {
      try {
        if (transaction) {
          const action =
            user.role === "admin" ? adminUpdateTransaction : updateTransaction;
          await dispatch(
            action({ id: transaction._id, fields: formPayload })
          ).unwrap();
        } else {
          await dispatch(createTransaction(formPayload)).unwrap();
        }
        if (formData.goal) dispatch(getGoals());
        onClose();
      } catch (err) {
        throw err;
      } finally {
        setIsLoading(false);
      }
    })();

    toast.promise(actionPromise, {
      loading: transaction ? "Đang cập nhật..." : "Đang tạo...",
      success: transaction ? "Cập nhật thành công!" : "Tạo thành công!",
      error: (err) => err?.message || "Đã xảy ra lỗi!",
    });
  };

  // --- STYLING HELPERS ---
  const inputClass = (error, disabled = false) => `
    w-full px-4 py-2.5 rounded-xl border outline-none transition-all
    ${
      error
        ? "border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50"
        : "border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-gray-50 dark:bg-[#2a2a30] dark:border-gray-600 dark:text-white"
    }
    ${
      disabled
        ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70 dark:bg-gray-800"
        : ""
    }
  `;

  // --- RENDER ---
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E1E24] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                transaction
                  ? "bg-blue-100 text-blue-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {transaction ? t("editTransaction") : t("addTransaction")}
              </h2>
              {isAdminEditing && (
                <span className="text-xs font-medium text-orange-500 flex items-center gap-1">
                  <ShieldAlert size={12} /> Chế độ Admin
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <form id="transaction-form" onSubmit={handleSubmit}>
            {/* 1. SỐ TIỀN & LOẠI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex gap-4">
                {/* Type Select */}
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t("type")}
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      disabled={isAdminEditing || goalType}
                      className={inputClass(null, isAdminEditing || goalType)}
                    >
                      <option value="income">{t("income")}</option>
                      <option value="expense">{t("expense")}</option>
                    </select>
                    {isAdminEditing && (
                      <Lock
                        className="absolute right-8 top-3 text-gray-400"
                        size={14}
                      />
                    )}
                  </div>
                </div>

                {/* Amount & Currency */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t("amount")} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      disabled={isAdminEditing}
                      placeholder="0"
                      className={`${inputClass(
                        errors.amount,
                        isAdminEditing
                      )} font-bold text-lg`}
                    />
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      disabled={isAdminEditing}
                      className={`w-24 rounded-xl border border-gray-200 bg-gray-50 dark:bg-[#2a2a30] dark:border-gray-600 dark:text-white px-2 py-2.5 outline-none ${
                        isAdminEditing ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {[...currencyMap].map(([code]) => (
                        <option key={code} value={code}>
                          {code}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. DANH MỤC & MỤC TIÊU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("categoriesLabel")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isAdminEditing || goalCategory}
                    className={inputClass(
                      errors.category,
                      isAdminEditing || goalCategory
                    )}
                  >
                    <option value="">-- {t("selectCategory")} --</option>
                    {categoryList.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.icon} {t(`categories.${item.key}`)}
                      </option>
                    ))}
                  </select>
                  {isAdminEditing && (
                    <Lock
                      className="absolute right-8 top-3 text-gray-400"
                      size={14}
                    />
                  )}
                </div>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              {/* Goal Select (Conditional) */}
              {formData.category === "saving" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t("financialGoal")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    disabled={
                      isAdminEditing ||
                      (goalId && !formData.goal ? false : !!goalId)
                    }
                    className={inputClass(errors.goal, isAdminEditing)}
                  >
                    <option value="">-- {t("selectGoal")} --</option>
                    {goals.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.goal && (
                    <p className="text-red-500 text-xs mt-1">{errors.goal}</p>
                  )}
                </div>
              )}
            </div>

            {/* 3. NGÀY & ĐỊNH KỲ */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {!formData.isRecurring ? (
                  <div className="flex-1 w-full">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <Calendar size={16} className="text-indigo-500" />{" "}
                      {t("date")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      disabled={isAdminEditing}
                      className={inputClass(errors.date, isAdminEditing)}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 w-full">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <Repeat size={16} className="text-orange-500" />{" "}
                      {t("recurringDay")} (1-31){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="recurringDay"
                      min={1}
                      max={31}
                      value={formData.recurringDay ?? ""}
                      onChange={handleChange}
                      disabled={isAdminEditing}
                      className={inputClass(
                        errors.recurringDay,
                        isAdminEditing
                      )}
                    />
                    {errors.recurringDay && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.recurringDay}
                      </p>
                    )}
                  </div>
                )}

                {/* Recurring Checkbox */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    disabled={isAdminEditing}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor="isRecurring"
                    className={`text-sm font-medium ${
                      isAdminEditing
                        ? "text-gray-400"
                        : "text-gray-700 dark:text-gray-300 cursor-pointer"
                    }`}
                  >
                    {t("recurringTransaction")}
                  </label>
                </div>
              </div>
            </div>

            {/* 4. GHI CHÚ (Admin được sửa) */}
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <FileText size={16} /> {t("note")}
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="2"
                className={inputClass(null, false)} // Luôn enable
                placeholder="Thêm ghi chú chi tiết..."
              ></textarea>
            </div>

            {/* 5. HÌNH ẢNH (Admin được sửa) */}
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ImageIcon size={16} /> {t("receipt")}
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {/* Existing Images */}
                {existingImages.map((url, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={url}
                      alt="receipt"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* New Images */}
                {formData.receiptImages.map((file, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors">
                  <ImageIcon className="text-gray-400 mb-1" size={24} />
                  <span className="text-xs text-gray-500">
                    {t("clickToUpload")}
                  </span>
                  <input
                    type="file"
                    name="receiptImages"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            {/* 6. ADMIN REASON (Chỉ hiện cho Admin) */}
            {user?.role === "admin" && (
              <div className="mt-6 pt-4 border-t border-red-100 dark:border-red-900/30">
                <label className="flex items-center gap-2 text-sm font-semibold text-red-600 mb-1.5">
                  <ShieldAlert size={16} /> Lý do chỉnh sửa{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Nhập lý do chi tiết cho người dùng..."
                  rows="2"
                  className={`${inputClass(
                    errors.reason,
                    false
                  )} border-red-200 bg-red-50/50 focus:ring-red-200`}
                ></textarea>
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/5"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            form="transaction-form"
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {transaction ? t("update") : t("add")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
