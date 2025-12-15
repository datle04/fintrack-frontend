import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CalendarClock, XCircle, Trash2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import ConfirmModal from "../ConfirmModal";
import toast from "react-hot-toast";
import { categoryList } from "../../constant/categoryList";
// Import thunk action từ slice của bạn
import {
  cancelRecurringTransaction,
  getRecurringTransactions,
} from "../../features/transactionSlice";

const RecurringTab = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // 1. Lấy dữ liệu từ Redux
  // Giả sử state.transaction.recurringTransactions lưu nguyên cục data bạn paste
  const { recurringTransactions, recurringLoading } = useSelector(
    (state) => state.transaction
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [actionType, setActionType] = useState(null); // 'stop' | 'delete_all'

  // 2. Gọi API lấy dữ liệu khi mount (nếu chưa có)
  useEffect(() => {
    dispatch(getRecurringTransactions());
  }, [dispatch]);

  useEffect(() => {
    console.log(recurringTransactions);
  }, [recurringTransactions]);

  // 3. 🔥 QUAN TRỌNG: Chuyển đổi Data Object thành Array để render
  const recurringList = useMemo(() => {
    // Kiểm tra an toàn: nếu không có data thì trả về mảng rỗng
    if (!recurringTransactions || !recurringTransactions.data) return [];

    // recurringTransactions.data là Object { "uuid": [tx], "uuid2": [tx] }
    // Chúng ta dùng Object.values để lấy mảng các value: [ [tx], [tx] ]
    // Sau đó map để lấy phần tử đầu tiên của mỗi nhóm (vì mỗi nhóm là 1 array)
    return Object.values(recurringTransactions.data)
      .map((group) => group[0]) // Lấy item đầu tiên làm đại diện hiển thị
      .filter((item) => item); // Lọc bỏ item null/undefined nếu có lỗi
  }, [recurringTransactions]);

  // --- Xử lý Action ---
  const handleActionClick = (tx, type) => {
    setSelectedTx(tx);
    setActionType(type);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedTx) return;
    const isDeleteAll = actionType === "delete_all";

    try {
      // Gọi API: Truyền ID của giao dịch hiện tại và cờ deleteAll
      // Lưu ý: selectedTx._id ở đây là ID của bản ghi template/đại diện
      await dispatch(
        cancelRecurringTransaction({
          id: selectedTx._id, // Backend sẽ tự tìm recurringId từ transaction này
          deleteAll: isDeleteAll,
        })
      ).unwrap();

      toast.success(
        isDeleteAll
          ? t("transactionPage.toast.deleteAllSuccess")
          : t("transactionPage.toast.stopSuccess")
      );
      setModalOpen(false);

      // Refresh lại list sau khi xóa
      dispatch(getRecurringTransactions());
    } catch (error) {
      toast.error(error?.message || t("error"));
    }
  };

  if (recurringLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4 animate-fadeIn">
      {recurringList.length === 0 ? (
        <div className="text-center p-10 flex flex-col items-center justify-center bg-white dark:bg-[#2E2E33] rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400">
          <CalendarClock className="h-12 w-12 mb-3 opacity-50" />
          <p>
            {t("noRecurringTransactions") || "Chưa có giao dịch định kỳ nào"}
          </p>
        </div>
      ) : (
        recurringList.map((item) => (
          <div
            key={item._id} // Hoặc item.recurringId
            className="bg-white dark:bg-[#2E2E33] rounded-lg p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow"
          >
            {/* --- Cột Thông tin --- */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Icon Category */}
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-600 flex items-center justify-center text-2xl flex-shrink-0">
                {categoryList.find((c) => c.key === item.category)?.icon ||
                  "📅"}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                    {t(`categories.${item.category}`)}
                  </h4>
                  {/* Badge Loại */}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      item.type === "income"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-red-50 text-red-500 border-red-200"
                    }`}
                  >
                    {item.type === "income" ? t("income") : t("expense")}
                  </span>
                </div>

                {/* Note & Frequency */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.note ? `${item.note} • ` : ""}
                  <span className="font-medium text-indigo-500">
                    {t("transactionPage.everyDay", {
                      day: item.recurringDay,
                    })}
                  </span>
                </p>
              </div>
            </div>

            {/* --- Cột Số tiền & Actions --- */}
            <div className="flex flex-row items-center justify-between w-full md:w-auto gap-6 mt-2 md:mt-0">
              {/* Amount */}
              <p
                className={`text-lg font-bold whitespace-nowrap ${
                  item.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.type === "income" ? "+" : "-"}
                {formatCurrency(item.amount, item.currency, i18n.language)}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {/* Nút Dừng (Stop) */}
                <button
                  onClick={() => handleActionClick(item, "stop")}
                  className="p-2 text-orange-500 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 rounded-lg transition-colors tooltip"
                  title={
                    t("stopRecurringTooltip") || "Dừng tạo mới (Giữ lịch sử)"
                  }
                >
                  <XCircle size={20} />
                </button>

                {/* Nút Xóa Hết (Delete All) */}
                <button
                  onClick={() => handleActionClick(item, "delete_all")}
                  className="p-2 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors tooltip"
                  title={
                    t("deleteAllTooltip") || "Xóa toàn bộ lịch sử và tương lai"
                  }
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* --- Modal Xác Nhận --- */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        title={
          <div className="flex justify-center items-center gap-2">
            <AlertTriangle className="text-yellow-500" />
            <span>
              {actionType === "stop"
                ? t("transactionPage.confirmStopTitle")
                : t("transactionPage.confirmDeleteAllTitle")}
            </span>
          </div>
        }
        message={
          actionType === "stop"
            ? t("transactionPage.confirmStopMessage") ||
              "Bạn có chắc muốn DỪNG giao dịch định kỳ này? Các giao dịch đã tạo trong quá khứ sẽ được GIỮ NGUYÊN."
            : t("transactionPage.confirmDeleteAllMessage") ||
              "CẢNH BÁO: Hành động này sẽ XÓA SẠCH toàn bộ giao dịch trong quá khứ lẫn tương lai của chuỗi này. Tiền trong Mục tiêu (nếu có) sẽ bị trừ lại. Không thể hoàn tác!"
        }
        variant="danger"
        confirmText={actionType === "stop" ? t("stop") : t("deleteAll")}
        cancelText={t("cancel")}
      />
    </div>
  );
};

export default RecurringTab;
