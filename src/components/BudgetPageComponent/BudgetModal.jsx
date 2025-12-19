import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBudget } from "../../features/budgetSlice";
import toast from "react-hot-toast";
import { useTranslation, Trans } from "react-i18next";
import { currencyMap } from "../../constant/currencies";
import { X, Plus, Trash2, Wallet, Calendar, AlertCircle } from "lucide-react";

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

  const [formData, setFormData] = useState({
    month: selectedMonth,
    year: selectedYear,
    totalAmount: "",
    currency: defaultCurrency,
    categories: [],
  });

  const prevCurrencyRef = useRef(formData.currency);
  const isFirstRender = useRef(true);

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
        totalAmount: currentBudget.originalAmount || currentBudget.totalAmount,
        currency:
          currentBudget.originalCurrency ||
          currentBudget.currency ||
          defaultCurrency,
        categories: (currentBudget.categoryStats || []).map((c) => ({
          name: c.category,
          amount: c.originalBudgetedAmount || c.amount,
        })),
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        totalAmount: "",
        categories: [],
        currency: defaultCurrency,
      }));
    }
  }, [selectedMonth, selectedYear, currentBudget, defaultCurrency]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCurrencyRef.current = formData.currency;
      return;
    }
    if (formData.currency !== prevCurrencyRef.current) {
      if (formData.totalAmount > 0 || formData.categories.length > 0) {
        toast(
          (tToast) => (
            <div className="flex flex-col gap-2">
              <span className="font-bold text-yellow-600 flex items-center gap-2">
                <AlertCircle size={18} /> {t("budgetPage.warning.title")}
              </span>
              <span className="text-sm text-gray-600">
                <Trans
                  i18nKey="budgetPage.warning.messageChange"
                  values={{
                    prev: prevCurrencyRef.current,
                    curr: formData.currency,
                  }}
                  components={{ 1: <b /> }}
                />
                <br />
                <Trans
                  i18nKey="budgetPage.warning.messageNote"
                  components={{ 1: <b /> }}
                />
              </span>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => toast.dismiss(tToast.id)}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                >
                  {t("budgetPage.warning.btnManual")}
                </button>
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

  const closeForm = (e) => {
    e.stopPropagation();
    setIsFormOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalAmount" ? Number(value) : value,
    }));
  };

  const getCategoryMeta = (key) =>
    categoryList.find((c) => c.key === key) || {};

  const addCategory = () => {
    const selected = formData.categories.map((c) => c.name);
    const available = categoryNames.filter((opt) => !selected.includes(opt));
    if (available.length === 0) return;
    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, { name: available[0], amount: "" }],
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
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mappedCategories = formData.categories.map((cat) => ({
      category: cat.name,
      originalAmount: Number(cat.amount),
    }));
    const payload = {
      month: Number(formData.month),
      year: Number(formData.year),
      originalAmount: Number(formData.totalAmount),
      originalCurrency: formData.currency,
      categories: mappedCategories,
    };
    try {
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
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E1E24] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
              <Wallet size={22} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {t("addBudget")}
            </h2>
          </div>
          <button
            onClick={closeForm}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <form id="budget-form" onSubmit={handleSubmit}>
            {/* 1. THỜI GIAN (Month/Year) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t("month")}
                </label>
                <div className="relative">
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="w-full p-2.5 pl-9 rounded-xl border border-gray-200 bg-gray-50 dark:bg-[#2a2a30] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    {monthValues?.map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                  <Calendar
                    size={16}
                    className="absolute left-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t("year")}
                </label>
                <div className="relative">
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full p-2.5 pl-9 rounded-xl border border-gray-200 bg-gray-50 dark:bg-[#2a2a30] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    {years?.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <Calendar
                    size={16}
                    className="absolute left-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. TỔNG NGÂN SÁCH (HERO INPUT) */}
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                {t("totalBudget")}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="0"
                  className="flex-1 text-2xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none px-2 py-1 text-gray-900 dark:text-white placeholder-gray-300 transition-colors"
                  required
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-24 bg-white dark:bg-[#2a2a30] border border-gray-300 dark:border-gray-600 rounded-lg px-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  {[...currencyMap].map(([code]) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              {/* THANH PHÂN BỔ (ALLOCATION BAR) */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-gray-500">
                    Đã chia: {sumAllocated.toLocaleString()}
                  </span>
                  <span
                    className={
                      isOverAllocated ? "text-red-500" : "text-green-600"
                    }
                  >
                    {isOverAllocated
                      ? `Vượt quá: ${Math.abs(unallocated).toLocaleString()}`
                      : `Còn lại: ${unallocated.toLocaleString()}`}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isOverAllocated ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (sumAllocated / (totalInput || 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 3. DANH SÁCH DANH MỤC */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t("categories.title")}
                </label>
                <button
                  type="button"
                  onClick={addCategory}
                  disabled={remainingOptions.length === 0}
                  className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                    remainingOptions.length === 0
                      ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                      : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
                  }`}
                >
                  + {t("add")}
                </button>
              </div>

              <div className="space-y-2">
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
                      className="group flex items-center gap-3 p-2 bg-white dark:bg-[#2a2a30] border border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-sm transition-all focus-within:ring-1 focus-within:ring-indigo-500"
                    >
                      {/* Icon & Select */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-lg text-lg">
                          {getCategoryMeta(cat.name).icon}
                        </div>
                        <select
                          value={cat.name}
                          onChange={(e) =>
                            updateCategory(index, "name", e.target.value)
                          }
                          className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-700 dark:text-white cursor-pointer"
                        >
                          {available.map((item) => (
                            <option key={item} value={item}>
                              {t(`categories.${item}`)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Amount Input */}
                      <input
                        type="number"
                        value={cat.amount}
                        onChange={(e) =>
                          updateCategory(index, "amount", e.target.value)
                        }
                        placeholder="0"
                        className="w-24 text-right bg-transparent border-none outline-none font-semibold text-gray-900 dark:text-white placeholder-gray-300"
                        required
                      />

                      {/* Delete Btn */}
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}

                {formData.categories.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-sm text-gray-400">
                      Chưa có danh mục nào được thêm.
                    </p>
                    <button
                      type="button"
                      onClick={addCategory}
                      className="mt-2 text-sm text-indigo-500 font-medium hover:underline"
                    >
                      Thêm ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-white/5">
          <button
            type="button"
            onClick={closeForm}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm transition-colors dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/5"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            form="budget-form"
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 flex items-center gap-2"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
