const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  goal,
}) => (
  <div>
    <label className="block text-sm font-medium mb-1 dark:text-white/83">
      {label}
    </label>
    <input
      disabled={!!goal && name === "targetOriginalAmount"}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      className={`
        w-full border border-gray-300 p-2 rounded-lg dark:bg-[#3A3B3C] dark:border-slate-600
        ${
          !!goal
            ? "cursor-not-allowed opacity-60 bg-gray-100 dark:bg-gray-700" // 3. Thêm style khi bị vô hiệu hóa
            : "cursor-pointer"
        }
        `}
    />
  </div>
);

export default InputField;
