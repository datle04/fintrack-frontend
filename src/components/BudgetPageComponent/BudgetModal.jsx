import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBudget } from "../../features/budgetSlice";
import toast from "react-hot-toast";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { currencyMap } from "../../utils/currencies";

const BudgetModal = ({
  categoryList,
  selectedMonth,
  selectedYear,
  monthValues,
  years,
  setIsFormOpen,
  token,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const error = useSelector((state) => state.budget.error);
  const user = useSelector((state) => state.auth.user);
  const defaultCurrency = user?.currency || "VND";
  const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;
  const dispatch = useDispatch();

  const categoryNames = categoryList.map((cat) => cat.key);

  const [formData, setFormData] = useState({
    month: selectedMonth,
    year: selectedYear,
    totalAmount: "",
    currency: defaultCurrency,
    categories: [],
  });

  const closeForm = (e) => {
    e.stopPropagation();
    setIsFormOpen(false);
  };

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await axios.get(/*...*/);
        const data = res.data;

        if (data && data.totalBudget > 0) {
          // --- SỬA Ở ĐÂY: Dùng functional update ---
          setFormData((prev) => ({
            ...prev, // Giữ lại month/year hiện tại
            totalAmount: data.originalAmount || 0,
            currency: data.originalCurrency || defaultCurrency,
            categories: data.categoryStats.map((c) => ({
              name: c.category,
              amount: c.originalBudgetedAmount,
            })),
          }));
        } else {
          // (Khối này đã đúng, nhưng hãy đảm bảo nó nhất quán)
          setFormData((prev) => ({
            ...prev, // Giữ lại month/year/currency
            totalAmount: "",
            categories: [],
          }));
        }
      } catch (error) {
        console.error("❌ Không lấy được budget:", error);
        setFormData((prev) => ({
          ...prev, // Giữ lại month/year/currency
          totalAmount: "",
          categories: [],
        }));
      }
    };

    fetchBudget();
    // BỎ 'defaultCurrency' khỏi dependency array
    // Nó chỉ nên được dùng để khởi tạo
  }, [formData.month, formData.year, token, BACK_END_URL]);

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
    const transformed = formData.categories.map((cat) => ({
      category: cat.name,
      amount: cat.amount,
    }));

    try {
      await dispatch(
        addBudget({
          month: Number(formData.month),
          year: Number(formData.year),
          totalAmount: Number(formData.totalAmount),
          currency: formData.currency,
          categories: transformed,
        })
      ).unwrap();

      toast.success("Đã lưu ngân sách!");
      setIsFormOpen(false);
      onClose?.();
    } catch (err) {
      // --- SỬA LỖI CHÍNH ---
      // Hiển thị thông báo lỗi thật từ backend/slice
      toast.error(err.message || "Đã xảy ra lỗi");
      // --- KẾT THÚC SỬA LỖI CHÍNH ---
    }
  };

  const selectedCategories = formData.categories.map((c) => c.name);
  const remainingOptions = categoryNames.filter(
    (opt) => !selectedCategories.includes(opt)
  );

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

          {/* --- BẮT ĐẦU THAY ĐỔI: Thêm select tiền tệ --- */}
          <div className="flex flex-row gap-2">
            {/* Total Amount */}
            <div className="flex-1">
              <label className="block font-medium text-gray-700 dark:text-white/83">
                {t("totalBudget")}:
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                placeholder="VD: 10000000"
                className="w-full p-2 border rounded dark:bg-[#2E2E33] dark:border-slate-700 dark:text-white/83"
                required
              />
            </div>

            {/* Currency Select */}
            <div className="w-1/3">
              <label className="block font-medium text-gray-700 dark:text-white/83">
                {t("currency")}:
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-[#2E2E33] dark:border-slate-700 dark:text-white/83"
              >
                {[...currencyMap].map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* --- KẾT THÚC THAY ĐỔI --- */}

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
                <div key={index} className="flex gap-2 mt-2">
                  <select
                    value={cat.name}
                    onChange={(e) =>
                      updateCategory(index, "name", e.target.value)
                    }
                    className="w-full p-2 border rounded dark:bg-[#2E2E33] dark:border-slate-700 dark:text-white/83"
                  >
                    {available.map((item) => {
                      const { icon } = getCategoryMeta(item);
                      return (
                        <option key={item} value={item}>
                          {icon} {t(`categories.${item}`)}
                        </option>
                      );
                    })}
                  </select>

                  <input
                    type="number"
                    value={cat.amount}
                    onChange={(e) =>
                      updateCategory(index, "amount", e.target.value)
                    }
                    placeholder={t("amount")}
                    className="w-[120px] p-2 border rounded dark:bg-[#2E2E33] dark:border-slate-700 dark:text-white/83"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="text-red-500 font-bold hover:scale-110 cursor-pointer transition-all"
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
