import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBudget } from "../../features/budgetSlice";
import toast from "react-hot-toast";
import axios from "axios";
import { useTranslation, Trans } from "react-i18next";
import { currencyMap } from "../../constant/currencies";

const BudgetModal = ({
  categoryList,
  selectedMonth,
  selectedYear,
  monthValues,
  years,
  setIsFormOpen,
  currentBudget,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const defaultCurrency = user?.currency || "VND";
  const dispatch = useDispatch();

  const categoryNames = categoryList.map((cat) => cat.key);

  useEffect(() => {
    console.log(currentBudget);
  }, []);

  const [formData, setFormData] = useState({
    month: selectedMonth,
    year: selectedYear,
    totalAmount: "",
    currency: defaultCurrency,
    categories: [],
  });

  // Ref để lưu trữ giá trị currency trước đó (để so sánh)
  const prevCurrencyRef = useRef(formData.currency);
  // Ref để kiểm tra xem có phải lần mount đầu tiên không
  const isFirstRender = useRef(true);

  const closeForm = (e) => {
    e.stopPropagation();
    setIsFormOpen(false);
  };

  // Tìm đoạn useEffect load data
  useEffect(() => {
    const isMatchingDate =
      currentBudget.month === Number(selectedMonth) &&
      currentBudget.year === Number(selectedYear);

    if (
      isMatchingDate &&
      (currentBudget.originalAmount > 0 || currentBudget.totalAmount > 0)
    ) {
      setFormData({
        month: selectedMonth,
        year: selectedYear,

        // Backend trả về originalAmount (tiền gốc), map vào totalAmount của Form
        totalAmount: currentBudget.originalAmount || currentBudget.totalAmount,

        // Backend trả về originalCurrency, map vào currency của Form
        currency:
          currentBudget.originalCurrency ||
          currentBudget.currency ||
          defaultCurrency,

        // Map danh sách categories
        categories: (currentBudget.categoryStats || []).map((c) => ({
          name: c.category,
          // Backend lưu 'originalAmount', map về 'amount' của Form
          amount: c.originalBudgetedAmount || c.amount,
        })),
      });
    } else {
      // Reset form
      setFormData((prev) => ({
        ...prev,
        totalAmount: "",
        categories: [],
        currency: defaultCurrency, // Reset về tiền tệ mặc định của user
      }));
    }
  }, [selectedMonth, selectedYear, currentBudget, defaultCurrency]);

  useEffect(() => {
    // Bỏ qua lần render đầu tiên (khi form mới mở)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCurrencyRef.current = formData.currency;
      return;
    }

    // Nếu currency thay đổi
    if (formData.currency !== prevCurrencyRef.current) {
      if (formData.totalAmount > 0 || formData.categories.length > 0) {
        toast(
          (tToast) => (
            <div className="flex flex-col gap-1">
              {/* TITLE */}
              <span className="font-bold text-yellow-600 flex items-center gap-2">
                {t("budgetPage.warning.title")}
              </span>

              <span className="text-sm text-gray-600">
                {/* MESSAGE 1: Đổi từ A sang B */}
                <Trans
                  i18nKey="budgetPage.warning.messageChange"
                  values={{
                    prev: prevCurrencyRef.current,
                    curr: formData.currency,
                  }}
                  components={{ 1: <b /> }} // <1> trong JSON sẽ được thay bằng <b>
                />
                <br />
                {/* MESSAGE 2: Không tự động quy đổi */}
                <Trans
                  i18nKey="budgetPage.warning.messageNote"
                  components={{ 1: <b /> }}
                />
              </span>

              <div className="flex gap-2 mt-2">
                {/* BUTTON 1 */}
                <button
                  onClick={() => toast.dismiss(tToast.id)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded font-medium hover:bg-indigo-200"
                >
                  {t("budgetPage.warning.btnManual")}
                </button>

                {/* BUTTON 2 */}
                <button
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      totalAmount: "",
                      categories: [],
                    }));
                    toast.dismiss(tToast.id);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                >
                  {t("budgetPage.warning.btnReset")}
                </button>
              </div>
            </div>
          ),
          {
            duration: 6000,
            position: "top-center",
            style: { border: "1px solid #FCD34D", padding: "16px" },
          }
        );
      }
      prevCurrencyRef.current = formData.currency;
    }
  }, [formData.currency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // Sửa: Đảm bảo 'totalAmount' là số, 'currency' là chuỗi
      [name]: name === "totalAmount" ? Number(value) : value,
    }));
  };

  const getCategoryMeta = (key) =>
    categoryList.find((c) => c.key === key) || {};

  const addCategory = () => {
    const selected = formData.categories.map((c) => c.name);
    const available = categoryNames.filter((opt) => !selected.includes(opt));
    if (available.length === 0) return;

    const newCategory = { name: available[0], amount: "" };
    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
  };

  const updateCategory = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.categories];
      updated[index] = {
        ...updated[index],
        [field]: field === "amount" ? Number(value) : value,
      };
      return { ...prev, categories: updated };
    });
  };

  const removeCategory = (index) => {
    const updated = formData.categories.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      categories: updated,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Map Categories: Đổi tên 'name' -> 'category' và 'amount' -> 'originalAmount'
    const mappedCategories = formData.categories.map((cat) => ({
      category: cat.name,
      originalAmount: Number(cat.amount), // ✅ Backend yêu cầu 'originalAmount'
      // ❌ Không gửi field 'amount' nữa để tránh lỗi "is not allowed"
    }));

    // 2. Chuẩn bị Payload khớp 100% với Joi Schema
    const payload = {
      month: Number(formData.month),
      year: Number(formData.year),

      // ✅ Đổi 'totalAmount' -> 'originalAmount'
      originalAmount: Number(formData.totalAmount),

      // ✅ Đổi 'currency' -> 'originalCurrency'
      originalCurrency: formData.currency,

      categories: mappedCategories,
    };

    try {
      // Gửi payload đã chuẩn hóa
      await dispatch(addBudget(payload)).unwrap();

      toast.success(t("budgetPage.success.add"));
      setIsFormOpen(false);
      onClose?.();
    } catch (err) {
      toast.error(err || "Đã xảy ra lỗi");
    }
  };

  const selectedCategories = formData.categories.map((c) => c.name);
  const remainingOptions = categoryNames.filter(
    (opt) => !selectedCategories.includes(opt)
  );

  const sumAllocated = formData.categories.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );
  const totalInput = Number(formData.totalAmount) || 0;
  const unallocated = totalInput - sumAllocated;
  const isOverAllocated = unallocated < 0;

  return (
    <section
      onClick={closeForm}
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[2px] bg-black/30"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-lg w-[90%] max-w-lg relative z-50 animate-fadeIn dark:bg-[#2E2E33]"
      >
        <h2 className="text-xl font-semibold mb-4 dark:text-white/90">
          {t("addBudget")}
        </h2>

        <div className="flex flex-col gap-4">
          {/* Month */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-white/83">
              {t("month")}:
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-[#2E2E33] dark:border-slate-700 dark:text-white/83"
            >
              {monthValues?.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-white/83">
              {t("year")}:
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-[#2E2E33] dark:border-slate-700 dark:text-white/83"
            >
              {years?.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Total Amount & Allocation Status */}
          <div className="mb-4">
            {/* --- KHỐI NHẬP TIỀN & ĐƠN VỊ --- */}
            <div className="flex gap-3 mb-1">
              {/* 1. Input Tổng tiền (Chiếm phần lớn) */}
              <div className="flex-1">
                <label className="block font-medium text-gray-700 dark:text-white/83 mb-1">
                  {t("totalBudget")}
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="VD: 10.000.000"
                  className="
                    w-full p-3 rounded-lg border border-gray-300 dark:border-slate-600 
                    bg-white dark:bg-[#2E2E33] text-gray-900 dark:text-white 
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none 
                    font-semibold text-lg transition-all
                  "
                  required
                />
              </div>

              {/* 2. Select Tiền tệ (Bên phải, cố định chiều rộng) */}
              <div className="w-28">
                <label className="block font-medium text-gray-700 dark:text-white/83 mb-1">
                  {t("currency")}
                </label>
                <div className="relative">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="
                      w-full p-3 pr-8 rounded-lg border border-gray-300 dark:border-slate-600 
                      bg-gray-50 dark:bg-[#3a3a41] text-gray-700 dark:text-white 
                      focus:ring-2 focus:ring-indigo-500 outline-none 
                      font-medium appearance-none cursor-pointer transition-all
                    "
                  >
                    {[...currencyMap].map(([code, label]) => (
                      <option key={code} value={code}>
                        {code} {/* Hiển thị mã ngắn gọn: VND, USD... */}
                      </option>
                    ))}
                  </select>

                  {/* Icon mũi tên custom (để thay thế mũi tên mặc định xấu xí) */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* THANH TRẠNG THÁI PHÂN BỔ (MỚI) */}
            <div
              className={`mb-4 text-sm font-medium flex justify-between items-center ${
                isOverAllocated ? "text-red-500" : "text-green-600"
              }`}
            >
              <span>Đã phân bổ: {sumAllocated.toLocaleString()}</span>
              <span>
                {isOverAllocated
                  ? `Vượt quá: ${Math.abs(unallocated).toLocaleString()}`
                  : `Còn lại: ${unallocated.toLocaleString()}`}
              </span>
            </div>
            {/* Progress Bar nhỏ */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${
                  isOverAllocated ? "bg-red-500" : "bg-green-500"
                } transition-all duration-300`}
                style={{
                  width: `${Math.min((sumAllocated / totalInput) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block font-medium text-gray-700 dark:text-white/83">
              {t("categories.title")}:
            </label>

            {formData.categories.map((cat, index) => {
              const selectedOthers = formData.categories
                .filter((_, i) => i !== index)
                .map((c) => c.name);

              const available = categoryNames.filter(
                (opt) => !selectedOthers.includes(opt) || opt === cat.name
              );

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 my-2 p-2 bg-gray-50 dark:bg-[#3a3a41] rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  {/* Select có Icon */}
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                      {getCategoryMeta(cat.name).icon}
                    </div>
                    <select
                      value={cat.name}
                      onChange={(e) =>
                        updateCategory(index, "name", e.target.value)
                      }
                      className="w-full pl-10 pr-8 py-2 bg-transparent border-none outline-none appearance-none cursor-pointer text-sm font-medium text-gray-700 dark:text-white"
                    >
                      {available.map((item) => (
                        <option key={item} value={item}>
                          {t(`categories.${item}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Amount */}
                  <input
                    type="number"
                    value={cat.amount}
                    onChange={(e) =>
                      updateCategory(index, "amount", e.target.value)
                    }
                    placeholder="Số tiền"
                    className="w-25 py-2 px-3 bg-white dark:bg-[#2E2E33] border border-gray-300 dark:border-gray-600 rounded text-right font-medium text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addCategory}
              className={`mt-2 font-semibold transition-all ${
                remainingOptions.length === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-500 hover:underline cursor-pointer"
              }`}
              disabled={remainingOptions.length === 0}
            >
              + {t("add")} {t("categories.title")}
            </button>
          </div>

          <button
            type="submit"
            className="bg-[#8574d4] text-white rounded p-2 mt-4 hover:bg-[#6A57DE] transition-all"
          >
            {t("save")}
          </button>
        </div>
      </form>
    </section>
  );
};

export default BudgetModal;
