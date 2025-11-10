const InfoItem = ({
  label,
  value,
  colorClass = "text-gray-800 dark:text-white/83",
}) => (
  <div className="flex justify-between">
    <span className="text-gray-500 dark:text-gray-400">{label}:</span>
    <span className={`font-semibold ${colorClass}`}>{value}</span>
  </div>
);

export default InfoItem;
