// src/pages/GoalPage.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../features/goalSlice";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Target,
  HandHeart,
} from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/formatCurrency";
import dayjs from "dayjs";
import { currencyMap } from "../utils/currencies";
import TransactionModal from "../components/TransactionModal";
import GoalCard from "../components/GoalPageComponent/GoalCard";
import GoalModal from "../components/GoalPageComponent/GoalModal";

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
    setSelectedGoalForContribute(goal);
    setIsTransactionModalOpen(true);
  };

  const handleDelete = (id) => {
    toast.promise(dispatch(deleteGoal(id)).unwrap(), {
      loading: "Đang xóa mục tiêu...",
      success: "Đã xóa mục tiêu thành công!",
      error: "Lỗi khi xóa mục tiêu.",
    });
  };

  const handleMarkCompleted = (goal) => {
    toast.promise(
      dispatch(
        updateGoal({
          id: goal._id,
          formData: { isCompleted: !goal.isCompleted },
        })
      ).unwrap(),
      {
        loading: "Đang cập nhật...",
        success: goal.isCompleted
          ? "Đã đặt lại trạng thái Đang tiến hành!"
          : "Chúc mừng! Mục tiêu đã hoàn thành!",
        error: "Lỗi khi cập nhật.",
      }
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-[#f5f6fa] min-h-screen dark:bg-[#35363A]">
      <header className="flex justify-end items-center mb-6">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow cursor-pointer hover:bg-indigo-600 transition-colors"
        >
          <Plus size={20} />
          {t("add")}
        </button>
      </header>

      {loading && (
        <p className="text-center text-indigo-500">{t("loading")}...</p>
      )}

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

      {goals.length === 0 && !loading && (
        <div className="text-center p-10 bg-white rounded-lg shadow dark:bg-[#2E2E33] dark:text-white/83">
          <Target size={40} className="mx-auto mb-3 text-indigo-400" />
          <p className="text-lg">
            {t("noData")}.{" "}
            {t("pleaseSetGoal") || "Hãy thiết lập mục tiêu đầu tiên của bạn!"}
          </p>
        </div>
      )}

      {isModalOpen && (
        <GoalModal
          goal={selectedGoalForEdit}
          onClose={() => setIsModalOpen(false)}
          t={t}
        />
      )}

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
