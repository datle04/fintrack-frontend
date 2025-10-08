import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminUpdateTransaction,
  createTransaction,
  updateTransaction,
} from "../features/transactionSlice";
import toast from "react-hot-toast";
import getUsedCategories from "../thunks/getUsedCategories";
import { useTranslation } from "react-i18next";
import { getNotifications } from "../features/notificationSlice";
import { debounce } from "lodash";
import getCategorySuggestion from "../thunks/getCategorySuggestion";

const now = new Date();
const initialState = {
  type: "income",
  amount: "",
  category: "",
  note: "",
  date: now.toISOString().slice(0, 10),
  receiptImages: [],
  isRecurring: false,
  recurringDay: now.getDate(),
};

const TransactionModal = ({ visible, onClose, transaction, categoryList }) => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [existingImages, setExistingImages] = useState([]);
  const [categorySuggest, setCategorySuggest] = useState("");

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date ? transaction.date.slice(0, 10) : "",
        receiptImages: [], // reset ảnh mới
      });

      setExistingImages(transaction.receiptImage || []); // ảnh đã có (URL)
    } else {
      setFormData(initialState);
      setExistingImages([]);
    }
  }, [transaction]);

  useEffect(() => {
    console.log(transaction);
  }, []);

  //Category Suggestion
  const debouncedSuggest = useMemo(
    () =>
      debounce(async (typeVal, noteVal) => {
        const suggestion = await getCategorySuggestion(typeVal, noteVal, token);
        setCategorySuggest(suggestion);
        console.log("Suggestion:", suggestion);
      }, 500),
    []
  );

  // Change handler
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "note") {
      debouncedSuggest(formData.type, value);
    }

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const selectedFiles = Array.from(files);
      const currentFiles = formData.receiptImages || [];

      const totalFiles = [...currentFiles, ...selectedFiles];
      const uniqueFiles = totalFiles.reduce((acc, file) => {
        if (!acc.find((f) => f.name === file.name)) acc.push(file);
        return acc;
      }, []);

      if (uniqueFiles.length > 5) {
        toast.error("You can upload up to 5 images only!");
        return;
      }

      setFormData((prev) => {
        const updated = { ...prev, receiptImages: uniqueFiles };
        console.log("Ảnh mới:", updated.receiptImages);
        return updated;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formPayload = new FormData();

      formPayload.append("type", formData.type);
      formPayload.append("amount", String(formData.amount));
      formPayload.append("category", formData.category);
      formPayload.append("note", formData.note);
      formPayload.append("date", formData.date);
      formPayload.append(
        "isRecurring",
        formData.isRecurring ? "true" : "false"
      );

      if (formData.isRecurring) {
        formPayload.append("recurringDay", formData.recurringDay || "1");
      }

      // Thêm các file mới (File)
      (formData.receiptImages || []).forEach((file) => {
        if (file instanceof File) {
          formPayload.append("receiptImages", file);
        }
      });

      // Gửi thêm mảng ảnh cũ (URL) nếu cần giữ lại ở backend
      if (existingImages.length > 0) {
        existingImages?.forEach((url) => {
          formPayload.append("existingImages", url); // backend cần hỗ trợ
        });
      }

      if (transaction) {
        if (user.role === "admin") {
          await dispatch(
            adminUpdateTransaction({ id: transaction._id, fields: formPayload })
          ).unwrap();
        } else {
          await dispatch(
            updateTransaction({ id: transaction._id, fields: formPayload })
          ).unwrap();
        }
        toast.success("Cập nhật thành công!");
        dispatch(getNotifications());
      } else {
        await dispatch(createTransaction(formPayload)).unwrap(); // tương tự
        toast.success("Tạo giao dịch thành công!");
      }

      onClose();
    } catch (err) {
      toast.error(err?.message || "Đã xảy ra lỗi!");
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[2px] bg-black/20">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-lg relative z-50 animate-fadeIn dark:bg-[#2E2E33] dark:text-white/83 dark:border dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4">
          {transaction ? t("addTransaction") : t("editTransaction")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{t("type")}</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded dark:focus:outline-slate-700"
            >
              <option value="income" className="dark:bg-[#2E2E33]">
                {t("income")}
              </option>
              <option value="expense" className="dark:bg-[#2E2E33]">
                {t("expense")}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm dark:focus:outline-slate-700">
              {t("amount")}
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

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

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium">
              {t("categoriesLabel")}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded dark:bg-[#2E2E33] dark:text-white/83"
              required
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

            {categorySuggest !== "" && formData.note !== "" && (
              <span className="text-sm font-medium text-slate-500">
                {t("suggestion")}: {categorySuggest}
              </span>
            )}
          </div>

          {!formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium">{t("date")}</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded dark:bg-[#2E2E33]"
                required
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isRecurring"
              className="cursor-pointer"
              checked={formData.isRecurring}
              onChange={handleChange}
            />
            <label className="text-sm cursor-pointer">
              {t("recurringTransaction")}
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium">
                {t("recurringDay")} (1-31)
              </label>
              <input
                type="number"
                name="recurringDay"
                min={1}
                max={31}
                value={formData.recurringDay ?? 0}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          )}

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
                name="receiptImages" // ✅ Bổ sung dòng này
                multiple
                onChange={handleChange}
                className="hidden"
              />
            </div>

            {/* Render receipt's images */}
            {/* Ảnh hóa đơn cũ từ backend */}
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
                      title="Xóa ảnh cũ"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Ảnh hóa đơn mới vừa chọn (từ File) */}
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
                        title="Xóa ảnh mới"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
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
