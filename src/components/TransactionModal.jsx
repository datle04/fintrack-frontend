import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminUpdateTransaction,
  createTransaction,
  updateTransaction,
} from "../features/transactionSlice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { getNotifications } from "../features/notificationSlice";
import { debounce } from "lodash";
import { currencyMap } from "../constant/currencies";
import { categoryList } from "../constant/categoryList";
import { getGoals } from "../features/goalSlice";
import { getDirtyValues } from "../utils/formUtils";

const now = new Date();

const TransactionModal = ({
  visible,
  onClose,
  transaction,
  goalType,
  goalCategory,
  goalId,
}) => {
  // Initial State
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
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const isAdminEditing = user?.role === "admin" && !!transaction;

  const [formData, setFormData] = useState(initialState);
  const [existingImages, setExistingImages] = useState([]);

  // 1️⃣ State lưu lỗi validation
  const [errors, setErrors] = useState({});

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
    setErrors({}); // Reset lỗi khi mở modal
  }, [transaction]);

  useEffect(() => {
    dispatch(getGoals());
  }, []);

  // Change handler
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // 2️⃣ Xóa lỗi của trường đang nhập khi người dùng thay đổi giá trị
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const selectedFiles = Array.from(files);
      // Validate file size/type nếu cần (Ví dụ < 5MB)
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

  // 3️⃣ Hàm Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Validate Amount (Thêm check isNaN)
    const amountNum = Number(formData.amount);
    if (!formData.amount) {
      newErrors.amount =
        t("validate.amountRequired") || "Vui lòng nhập số tiền";
    } else if (isNaN(amountNum) || amountNum <= 0) {
      // Check thêm isNaN để chặn nhập chữ
      newErrors.amount =
        t("validate.amountPositive") || "Số tiền phải là số lớn hơn 0";
    }

    // 2. Validate Category
    if (!formData.category) {
      newErrors.category =
        t("validate.categoryRequired") || "Vui lòng chọn danh mục";
    }

    // 3. Validate Goal
    if (formData.category === "saving" && !formData.goal) {
      newErrors.goal =
        t("validate.goalRequired") || "Vui lòng chọn mục tiêu tiết kiệm";
    }

    // 4. Validate Recurring Logic
    if (formData.isRecurring) {
      const day = Number(formData.recurringDay);
      // Thêm Number.isInteger để chặn số lẻ (ví dụ 5.5)
      if (!day || isNaN(day) || day < 1 || day > 31 || !Number.isInteger(day)) {
        newErrors.recurringDay =
          t("validate.invalidDay") ||
          "Ngày định kỳ phải là số nguyên từ 1 đến 31";
      }
    } else {
      // Chỉ bắt buộc Date nếu KHÔNG phải là recurring
      if (!formData.date) {
        newErrors.date = t("validate.dateRequired") || "Vui lòng chọn ngày";
      }
    }

    // 5. Validate Admin Reason
    if (user.role === "admin" && !formData.reason?.trim()) {
      newErrors.reason =
        t("validate.reasonRequired") || "Vui lòng nhập lý do chỉnh sửa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ VALIDATE (Giữ nguyên)
    if (!validateForm()) {
      toast.error(
        t("validate.checkForm") || "Vui lòng kiểm tra lại thông tin!"
      );
      return;
    }

    const formPayload = new FormData();
    let hasChanges = false; // Cờ kiểm tra xem có gì thay đổi không

    // =========================================================
    // TRƯỜNG HỢP 1: CẬP NHẬT (UPDATE)
    // =========================================================
    if (transaction) {
      // 🚨 LOGIC RIÊNG CHO ADMIN
      if (user.role === "admin") {
        // --- 1. Kiểm tra Reason (Bắt buộc) ---
        if (!formData.reason?.trim()) {
          toast.error("Admin bắt buộc phải nhập lý do chỉnh sửa!");
          return;
        }
        formPayload.append("reason", formData.reason);

        // --- 2. Kiểm tra Note ---
        if (formData.note !== transaction.note) {
          formPayload.append("note", formData.note);
          hasChanges = true;
        }

        // --- 3. Kiểm tra Ảnh ---
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
          return; // Dừng ngay
        }
      }

      // 🚨 LOGIC CHO USER THƯỜNG (Dùng else để Admin không lọt vào đây)
      else {
        // A. Tìm các trường thay đổi
        const dirtyFields = getDirtyValues(transaction, formData);

        // B. Logic Ảnh
        const newFiles = (formData.receiptImages || []).filter(
          (f) => f instanceof File
        );
        const hasNewFiles = newFiles.length > 0;
        const originalImagesCount = (transaction.receiptImage || []).length;
        const currentExistingImagesCount = existingImages.length;
        const hasDeletedImages =
          originalImagesCount !== currentExistingImagesCount;

        // C. Kiểm tra có thay đổi không
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

        // D. Append các trường thay đổi
        Object.keys(dirtyFields).forEach((key) => {
          // ⛔️ Loại bỏ reason và ảnh ra khỏi vòng lặp này (để xử lý riêng hoặc không gửi)
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

        // E. Append Ảnh
        if (hasNewFiles || hasDeletedImages) {
          newFiles.forEach((file) => formPayload.append("receiptImages", file));
          existingImages.forEach((url) =>
            formPayload.append("existingImages", url)
          );
        }
      }
    }

    // =========================================================
    // TRƯỜNG HỢP 2: TẠO MỚI (CREATE) - Logic Gửi Hết
    // =========================================================
    else {
      hasChanges = true; // Tạo mới luôn là có thay đổi

      // Append các trường cơ bản
      formPayload.append("type", formData.type);
      formPayload.append("amount", String(formData.amount));
      formPayload.append("currency", formData.currency);
      formPayload.append("category", formData.category);
      formPayload.append("note", formData.note || "");

      // Logic Date mặc định
      if (formData.date) {
        formPayload.append("date", formData.date);
      } else if (formData.isRecurring) {
        formPayload.append("date", new Date().toISOString());
      }

      // Recurring
      formPayload.append("isRecurring", String(formData.isRecurring));
      if (formData.isRecurring) {
        formPayload.append("recurringDay", formData.recurringDay || "1");
      }

      if (formData.goal) formPayload.append("goalId", formData.goal);

      // Trong handleSubmit
      console.log("Check Images:", formData.receiptImages);

      // Ảnh (Chỉ có upload mới, không có existing)
      (formData.receiptImages || []).forEach((file) => {
        if (file instanceof File) formPayload.append("receiptImages", file);
      });
    }

    for (var pair of formPayload.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    // =========================================================
    // GỌI API (ACTION)
    // =========================================================
    if (!hasChanges) return; // Chặn lần cuối cho chắc

    const actionPromise = (async () => {
      if (transaction) {
        // UPDATE (PATCH)
        const action =
          user.role === "admin" ? adminUpdateTransaction : updateTransaction;
        await dispatch(
          action({ id: transaction._id, fields: formPayload })
        ).unwrap();
      } else {
        // CREATE (POST)
        await dispatch(createTransaction(formPayload)).unwrap();
      }

      if (formData.goal) dispatch(getGoals());
    })();

    toast.promise(actionPromise, {
      loading: transaction ? "Đang cập nhật..." : "Đang tạo...",
      success: transaction ? "Cập nhật thành công!" : "Tạo thành công!",
      error: (err) => err?.message || "Đã xảy ra lỗi!",
    });

    actionPromise.then(() => onClose()).catch((err) => console.error(err));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[2px] bg-black/20">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-lg relative z-50 animate-fadeIn dark:bg-[#2E2E33] dark:text-white/83 dark:border dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {transaction ? t("editTransaction") : t("addTransaction")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Select */}
          <div>
            <label className="block text-sm font-medium">{t("type")}</label>
            <select
              name="type"
              value={formData.type}
              disabled={isAdminEditing}
              onChange={handleChange}
              className={`w-full border px-3 py-2 rounded dark:focus:outline-slate-700 ${
                isAdminEditing
                  ? "bg-gray-100 cursor-not-allowed opacity-60"
                  : ""
              } ${goalType ? "pointer-events-none opacity-70" : ""}`}
            >
              <option value="income" className="dark:bg-[#2E2E33]">
                {t("income")}
              </option>
              <option value="expense" className="dark:bg-[#2E2E33]">
                {t("expense")}
              </option>
            </select>
          </div>

          {/* Amount & Currency */}
          <div className="flex flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm dark:focus:outline-slate-700">
                {t("amount")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                disabled={isAdminEditing}
                onChange={handleChange}
                // 5️⃣ UI hiển thị lỗi (Border đỏ)
                className={`w-full border px-3 py-2 rounded ${
                  isAdminEditing
                    ? "bg-gray-100 cursor-not-allowed opacity-60"
                    : ""
                } ${errors.amount ? "border-red-500 focus:ring-red-200" : ""}`}
              />
              {/* 6️⃣ UI hiển thị text lỗi */}
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            <div className="w-1/3">
              <label className="block text-sm font-medium">
                {t("currency")}
              </label>
              <select
                name="currency"
                value={formData.currency}
                disabled={isAdminEditing}
                onChange={handleChange}
                className={`w-full border px-3 py-2 rounded outline-none dark:focus:outline-slate-700 dark:bg-[#2E2E33] ${
                  isAdminEditing
                    ? "bg-gray-100 cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                {[...currencyMap].map(([code, label]) => (
                  <option key={code} value={code} className="dark:bg-[#2E2E33]">
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium">{t("note")}</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              rows="2"
            ></textarea>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium">
              {t("categoriesLabel")} <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              disabled={isAdminEditing}
              onChange={handleChange}
              className={`w-full border px-3 py-2 rounded dark:focus:outline-slate-700 ${
                isAdminEditing
                  ? "bg-gray-100 cursor-not-allowed opacity-60"
                  : ""
              } ${goalCategory ? "pointer-events-none opacity-70" : ""} ${
                errors.category ? "border-red-500" : ""
              }`}
            >
              <option value="">-- {t("selectCategory")} --</option>
              {Array.isArray(categoryList) &&
                categoryList.map((item) => (
                  <option
                    key={item.key}
                    value={item.key}
                    className="dark:bg-[#2E2E33] dark:text-white/83"
                  >
                    {t(`categories.${item.key}`)} {item.icon}
                  </option>
                ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs">{errors.category}</p>
            )}
          </div>

          {/* Goal Selection (If saving) */}
          {formData.category === "saving" && (
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium">
                {t("financialGoal")} <span className="text-red-500">*</span>
              </label>
              <select
                name="goal"
                value={formData.goal}
                disabled={isAdminEditing}
                onChange={handleChange}
                className={`w-full border px-3 py-2 rounded dark:focus:outline-slate-700 ${
                  isAdminEditing
                    ? "bg-gray-100 cursor-not-allowed opacity-60"
                    : ""
                } ${
                  goalId && !formData.goal
                    ? ""
                    : goalId
                    ? "pointer-events-none opacity-70"
                    : ""
                } ${errors.goal ? "border-red-500" : ""}`}
              >
                <option value="">-- {t("selectGoal")} --</option>
                {Array.isArray(goals) &&
                  goals.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                      className="dark:bg-[#2E2E33] dark:text-white/83"
                    >
                      {item.name}
                    </option>
                  ))}
              </select>
              {errors.goal && (
                <p className="text-red-500 text-xs">{errors.goal}</p>
              )}
            </div>
          )}

          {/* Date Selection */}
          {!formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium">
                {t("date")} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                disabled={isAdminEditing}
                onChange={handleChange}
                className={`w-full border px-3 py-2 rounded dark:bg-[#2E2E33] ${
                  isAdminEditing
                    ? "bg-gray-100 cursor-not-allowed opacity-60"
                    : ""
                } ${errors.date ? "border-red-500" : ""}`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>
          )}

          {/* Recurring Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isRecurring"
              className="cursor-pointer"
              disabled={isAdminEditing}
              checked={formData.isRecurring}
              onChange={handleChange}
            />
            <label
              className={`text-sm ${
                isAdminEditing
                  ? "bg-gray-100 cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              {t("recurringTransaction")}
            </label>
          </div>

          {/* Recurring Day */}
          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium">
                {t("recurringDay")} (1-31){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="recurringDay"
                disabled={isAdminEditing}
                min={1}
                max={31}
                value={formData.recurringDay ?? ""}
                onChange={handleChange}
                className={`w-full border px-3 py-2 rounded  ${
                  isAdminEditing
                    ? "bg-gray-100 cursor-not-allowed opacity-60"
                    : ""
                }  ${errors.recurringDay ? "border-red-500" : ""}`}
              />
              {errors.recurringDay && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.recurringDay}
                </p>
              )}
            </div>
          )}

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("receipt")}
            </label>
            <div className="relative w-full p-4 border-2 border-dashed rounded-lg text-center hover:bg-gray-50 hover:text-indigo-600 cursor-pointer transition dark:hover:bg-[#424249] dark:hover:text-white/87">
              <label
                htmlFor="file-upload"
                className="cursor-pointer block text-gray-600 dark:text-gray-500"
              >
                📎 {t("clickToUpload")}
              </label>
              <input
                id="file-upload"
                type="file"
                name="receiptImages"
                multiple
                onChange={handleChange}
                className="hidden"
                accept="image/*" // Chỉ cho phép chọn ảnh
              />
            </div>
            {/* ... Phần hiển thị ảnh giữ nguyên ... */}
            {existingImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {existingImages.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative group">
                    <img
                      src={url}
                      alt={`Receipt ${idx + 1}`}
                      className="rounded border max-h-32 w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1 opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {formData.receiptImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {formData.receiptImages.map((file, idx) => {
                  const objectUrl = URL.createObjectURL(file);
                  return (
                    <div key={`new-${idx}`} className="relative group">
                      <img
                        src={objectUrl}
                        alt={file.name}
                        className="rounded border max-h-32 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1 opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Reason */}
          {user?.role === "admin" && (
            <div>
              <label className="block text-sm font-medium">
                Lý do chỉnh sửa <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Nhập lý do (bắt buộc cho admin)"
                className={`w-full border-2 px-3 py-2 rounded outline-none bg-red-50 placeholder-red-400 ${
                  errors.reason ? "border-red-500" : "border-red-400"
                }`}
                rows="2"
              ></textarea>
              {errors.reason && (
                <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer dark:bg-gray-600 dark:hover:bg-gray-700 transition-all"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 cursor-pointer dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all"
            >
              {transaction ? t("update") : t("add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
