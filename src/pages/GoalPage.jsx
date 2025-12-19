import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getGoals, updateGoal, deleteGoal } from "../features/goalSlice";
import { Plus, Target } from "lucide-react";
import toast from "react-hot-toast";
import TransactionModal from "../components/TransactionModal";
import GoalCard from "../components/GoalPageComponent/GoalCard";
import GoalModal from "../components/GoalPageComponent/GoalModal";
import GoalPageLoading from "../components/Loading/GoalLoading/GoalPageLoading";

const GoalPage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { goals, loading } = useSelector((state) => state.goals);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState(null);
  const [selectedGoalForContribute, setSelectedGoalForContribute] =
    useState(null);

  useEffect(() => {
    dispatch(getGoals());
  }, [dispatch]);

  const handleOpenModal = (goal = null) => {
    setSelectedGoalForEdit(goal);
    setIsModalOpen(true);
  };

  const handleOpenContributeModal = (goal) => {
    if (goal.status !== "in_progress") {
      toast.error(
        t("goalPage.cannotContribute") ||
          "Chỉ có thể thêm giao dịch cho mục tiêu đang tiến hành"
      );
      return;
    }
    setSelectedGoalForContribute(goal);
    setIsTransactionModalOpen(true);
  };

  const handleDelete = (id) => {
    toast.promise(dispatch(deleteGoal(id)).unwrap(), {
      loading: t("goalPage.deletingGoal"),
      success: t("goalPage.deleteSuccess"),
      error: t("goalPage.deleteError"),
    });
  };

  const handleMarkCompleted = (goal) => {
    const newStatus = goal.status === "completed" ? "in_progress" : "completed";

    const successMsg =
      newStatus === "completed"
        ? t("goalPage.toast.completed")
        : t("goalPage.toast.resetStatus");

    toast.promise(
      dispatch(
        updateGoal({
          id: goal._id,
          formData: { status: newStatus },
        })
      ).unwrap(),
      {
        loading: t("goalPage.toast.updating"),
        success: successMsg,
        error: t("goalPage.toast.updateError"),
      }
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-[#f5f6fa] min-h-screen dark:bg-[#35363A]">
      {loading && <GoalPageLoading />}
      {!loading && (
        <>
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">
                {t("financialGoal")}
              </h1>
              <p className="text-gray-500 text-sm dark:text-gray-400">
                {goals.length} {t("financialGoal").toLowerCase()}
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow cursor-pointer hover:bg-indigo-600 transition-colors"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">{t("add")}</span>
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onEdit={() => handleOpenModal(goal)}
                onDelete={() => handleDelete(goal._id)}
                onComplete={() => handleMarkCompleted(goal)}
                onContribute={() => handleOpenContributeModal(goal)}
                t={t}
                i18n={i18n}
              />
            ))}
          </div>

          {goals.length === 0 && (
            <div className="text-center p-10 bg-white rounded-lg shadow dark:bg-[#2E2E33] dark:text-white/83">
              <Target size={40} className="mx-auto mb-3 text-indigo-400" />
              <p className="text-lg">
                {t("goalPage.noData")}. {t("goalPage.pleaseSetGoal")}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal Sửa/Tạo Goal */}
      {isModalOpen && (
        <GoalModal
          goal={selectedGoalForEdit}
          onClose={() => setIsModalOpen(false)}
          t={t}
        />
      )}

      {/* Modal Thêm giao dịch (Đóng góp) */}
      {isTransactionModalOpen && (
        <TransactionModal
          visible={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          goalId={selectedGoalForContribute?._id}
          goalType={"expense"}
          goalCategory={"saving"}
        />
      )}
    </div>
  );
};

export default GoalPage;
