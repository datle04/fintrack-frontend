import { formatCurrency } from "../../utils/formatCurrency";

const SavingsRec = ({ period, amount, t, i18n, currency }) => (
  <div className="p-2 bg-indigo-50 rounded-lg dark:bg-[#35363A] border dark:border-slate-600">
    <p className="font-bold text-gray-800 dark:text-white/90">
      {formatCurrency(amount.toFixed(0), currency, i18n.language)}
    </p>
    <p className="text-gray-500 text-[10px] sm:text-xs dark:text-gray-400 mt-1">
      /{period}
    </p>
  </div>
);

export default SavingsRec;
